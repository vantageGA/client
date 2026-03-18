import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './ProfileEditView.scss';

import {
  profileOfLoggedInUserAction,
  createProfileAction,
  profileUpdateAction,
  profileImagesAction,
  updateOnboardingTutorialAction,
} from '../../store/actions/profileActions';
import {
  deleteQualificationDocumentAction,
  qualificationDocumentsAction,
  replaceQualificationDocumentAction,
} from '../../store/actions/qualificationDocumentActions';
import {
  uploadQualificationDocumentAction,
} from '../../store/actions/qualificationDocumentActions';

import {
  PROFILE_UPDATE_RESET,
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_RESET,
  PROFILE_OF_LOGGED_IN_USER_RESET,
} from '../../store/constants/profileConstants';
import {
  QUALIFICATION_DOCUMENT_DELETE_RESET,
  QUALIFICATION_DOCUMENT_REPLACE_RESET,
  QUALIFICATION_DOCUMENT_UPLOAD_RESET,
} from '../../store/constants/qualificationDocumentConstants';

import {
  profileImageUploadAction,
  deleteProfileImageAction,
} from '../../store/actions/imageUploadActions';

import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Message from '../../components/message/Message';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Rating from '../../components/rating/Rating';
import FormSectionAccordion from '../../components/formSectionAccordion/FormSectionAccordion';
import OnboardingTutorial from '../../components/onboardingTutorial/OnboardingTutorial';

import moment from 'moment';
import QuillEditor from '../../components/quillEditor/QuillEditor';
import DOMPurify from 'dompurify';
import FaceBookComponent from '../../components/socialMedia/faceBook/FaceBookComponent';
import InstagramComponent from '../../components/socialMedia/Instagram/InstagramComponent';
import InfoComponent from '../../components/info/InfoComponent';
import onboardingTutorialVideo from '../../assets/video/BV Onboarding 20.02.2026.mp4';

const sanitize = (value) =>
  DOMPurify.sanitize(value || '', {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'a',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();

const defaultTutorialState = {
  required: true,
  hasInteracted: false,
  interactionType: null,
  watchProgressPercent: 0,
  manualAcknowledged: false,
  completionThresholdPercent: 90,
  isCompleted: false,
  completedAt: null,
};

const SPECIALISATION_MAX_CHARACTERS = 400;
const MAX_QUALIFICATION_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_QUALIFICATION_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);
const QUALIFICATION_DOCUMENT_ACCEPT_ATTRIBUTE =
  'application/pdf,image/jpeg,image/png';

const formatQualificationDocumentStatus = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Not Submitted';
  }
};

const buildQualificationStatusMessage = ({
  status,
  activeDocument,
}) => {
  const rejectionReason = activeDocument?.rejectionReason?.trim();
  const reviewedAt = activeDocument?.reviewedAt;
  const uploadedAt = activeDocument?.createdAt || activeDocument?.uploadedAt;

  switch (status) {
    case 'approved':
      return {
        tone: 'approved',
        title: 'Approved',
        body:
          'Your qualification document has been approved and your verification status is active on supported profile surfaces.',
        meta: reviewedAt
          ? `Approved on ${moment(reviewedAt).format('D MMM YYYY')}.`
          : null,
      };
    case 'pending':
      return {
        tone: 'pending',
        title: 'Pending',
        body:
          'Your latest qualification document has been received and is waiting for review.',
        meta: uploadedAt
          ? `Submitted on ${moment(uploadedAt).format('D MMM YYYY')}.`
          : null,
      };
    case 'rejected':
      return {
        tone: 'rejected',
        title: 'Rejected',
        body:
          'Your latest qualification document was reviewed but could not be approved yet. Please replace it with an updated file.',
        meta: rejectionReason || null,
      };
    default:
      return {
        tone: 'none',
        title: 'Not Submitted',
        body:
          'Upload a qualification document to start the verification process for your profile.',
        meta: null,
      };
  }
};

const buildQualificationSummaryStatus = ({
  status,
  activeDocument,
}) => {
  const rejectionReason = activeDocument?.rejectionReason?.trim();
  const reviewedAt = activeDocument?.reviewedAt;
  const uploadedAt = activeDocument?.createdAt || activeDocument?.uploadedAt;

  switch (status) {
    case 'approved':
      return {
        icon: 'fa-check',
        tone: 'confirmed',
        label: 'Verified',
        detail: reviewedAt
          ? `Approved on ${moment(reviewedAt).format('D MMM YYYY')}.`
          : 'Your qualification document has been approved.',
      };
    case 'pending':
      return {
        icon: 'fa-clock-o',
        tone: 'pending',
        label: 'Pending Review',
        detail: uploadedAt
          ? `Submitted on ${moment(uploadedAt).format('D MMM YYYY')} and awaiting review.`
          : 'Your latest qualification document is awaiting review.',
      };
    case 'rejected':
      return {
        icon: 'fa-exclamation-circle',
        tone: 'rejected',
        label: 'Rejected',
        detail: rejectionReason
          ? `Reason: ${rejectionReason}`
          : 'Replace your qualification document to continue verification.',
      };
    default:
      return {
        icon: 'fa-upload',
        tone: 'not-submitted',
        label: 'Not Submitted',
        detail:
          'Upload a qualification document to start the verification process for your profile.',
      };
  }
};

const ProfileEditView = () => {
  const emailRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  const telephoneNumberRegEx = /^(?:07\d{8,12}|447\d{7,11})$/;
  const normalizeTelephoneNumber = (value) => value.replace(/\s+/g, '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logged in user Details saved in local storage
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Profile details in DB
  const profileState = useSelector((state) => state.profileOfLoggedInUser);
  const { loading, error, profile } = profileState;

  // Profile creation state
  const profileCreateState = useSelector((state) => state.profileCreate);
  const { loading: createLoading, error: createError } = profileCreateState;

  // PROFILE image upload
  const profileImageStore = useSelector((state) => state.profileImage);
  const { loading: profileImageLoading } = profileImageStore;

  // Profile update state
  const profileUpdateState = useSelector((state) => state.profileUpdate);
  const {
    success: updateSuccess,
    error: updateError,
    errorCode: updateErrorCode,
  } = profileUpdateState;

  // Onboarding tutorial update state
  const profileOnboardingTutorialUpdateState = useSelector(
    (state) => state.profileOnboardingTutorialUpdate,
  );
  const {
    loading: tutorialUpdateLoading,
    error: tutorialUpdateError,
    onboardingTutorial: tutorialUpdateData,
  } = profileOnboardingTutorialUpdateState;

  // PROFILE images
  const profileImagesState = useSelector((state) => state.profileImages);
  const { error: profileImagesError, profileImages } = profileImagesState;

  // Qualification documents
  const qualificationDocumentsState = useSelector(
    (state) => state.qualificationDocuments,
  );
  const {
    loading: qualificationDocumentsLoading,
    error: qualificationDocumentsError,
    documents: qualificationDocuments = [],
    activeDocumentId,
    profileStatus: qualificationDocumentProfileStatus,
  } = qualificationDocumentsState;
  const qualificationDocumentUploadState = useSelector(
    (state) => state.qualificationDocumentUpload,
  );
  const {
    loading: qualificationDocumentUploadLoading,
    success: qualificationDocumentUploadSuccess,
    error: qualificationDocumentUploadError,
  } = qualificationDocumentUploadState;
  const qualificationDocumentReplaceState = useSelector(
    (state) => state.qualificationDocumentReplace,
  );
  const {
    loading: qualificationDocumentReplaceLoading,
    success: qualificationDocumentReplaceSuccess,
    error: qualificationDocumentReplaceError,
    message: qualificationDocumentReplaceMessage,
  } = qualificationDocumentReplaceState;
  const qualificationDocumentDeleteState = useSelector(
    (state) => state.qualificationDocumentDelete,
  );
  const {
    loading: qualificationDocumentDeleteLoading,
    success: qualificationDocumentDeleteSuccess,
    error: qualificationDocumentDeleteError,
    message: qualificationDocumentDeleteMessage,
  } = qualificationDocumentDeleteState;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [faceBook, setFaceBook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [description, setDescription] = useState('');
  const [specialisation, setSpecialisation] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [location, setLocation] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [selectedQualificationDocument, setSelectedQualificationDocument] =
    useState(null);
  const [qualificationDocumentValidationError, setQualificationDocumentValidationError] =
    useState('');
  const [isQualificationDragActive, setIsQualificationDragActive] =
    useState(false);
  const [qualificationDocumentActionTarget, setQualificationDocumentActionTarget] =
    useState({
      id: '',
      type: '',
    });

  const [keyWordSearchOne, setkeyWordSearchOne] = useState('');
  const [keyWordSearchTwo, setkeyWordSearchTwo] = useState('');
  const [keyWordSearchThree, setkeyWordSearchThree] = useState('');
  const [keyWordSearchFour, setkeyWordSearchFour] = useState('');
  const [keyWordSearchFive, setkeyWordSearchFive] = useState('');

  const [specialisationOne, setSpecialisationOne] = useState('');
  const [specialisationTwo, setSpecialisationTwo] = useState('');
  const [specialisationThree, setSpecialisationThree] = useState('');
  const [specialisationFour, setSpecialisationFour] = useState('');

  const [showHelp, setShowHelp] = useState(false);
  const [openSection, setOpenSection] = useState('');
  const [pendingFocusId, setPendingFocusId] = useState('');
  const [onboardingTutorial, setOnboardingTutorial] = useState(
    defaultTutorialState,
  );

  // Refs
  const fileInputRef = useRef(null);
  const descriptionEditorRef = useRef(null);
  const qualificationDocumentInputRef = useRef(null);
  const qualificationDocumentReplaceInputRef = useRef(null);

  // Notification state for centralized message management
  const [notification, setNotification] = useState({
    message: '',
    variant: 'error',
  });

  // Touched state for blur-triggered validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    telephoneNumber: false,
    keyWordSearchOne: false,
    keyWordSearchTwo: false,
    keyWordSearchThree: false,
    keyWordSearchFour: false,
    keyWordSearchFive: false,
    specialisationOne: false,
    specialisationTwo: false,
    specialisationThree: false,
    specialisationFour: false,
  });

  const showNotification = (message, variant = 'error') => {
    setNotification({ message, variant });
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    if (!profile) {
      dispatch(profileOfLoggedInUserAction());
    }

    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setFaceBook(profile.faceBook ?? '');
      setInstagram(profile.instagram ?? '');
      setWebsiteUrl(profile.websiteUrl ?? '');
      setProfileImage(profile.profileImage ?? '');
      setDescription(profile.description ?? '');
      setSpecialisation(profile.specialisation ?? '');
      setQualifications(profile.qualifications ?? '');
      setLocation(profile.location ?? '');
      setTelephoneNumber(profile.telephoneNumber ?? '');
      setkeyWordSearchOne(profile.keyWordSearchOne ?? '');
      setkeyWordSearchTwo(profile.keyWordSearchTwo ?? '');
      setkeyWordSearchThree(profile.keyWordSearchThree ?? '');
      setkeyWordSearchFour(profile.keyWordSearchFour ?? '');
      setkeyWordSearchFive(profile.keyWordSearchFive ?? '');
      setSpecialisationOne(profile.specialisationOne ?? '');
      setSpecialisationTwo(profile.specialisationTwo ?? '');
      setSpecialisationThree(profile.specialisationThree ?? '');
      setSpecialisationFour(profile.specialisationFour ?? '');
      setOnboardingTutorial({
        ...defaultTutorialState,
        ...(profile.onboardingTutorial || {}),
      });
    }
  }, [navigate, dispatch, userInfo, profile]);

  // Fetch profile images once on mount
  useEffect(() => {
    dispatch(profileImagesAction());
  }, [dispatch]);

  useEffect(() => {
    if (!profile?._id) return;

    dispatch(qualificationDocumentsAction());
  }, [dispatch, profile?._id]);

  // Watch profileUpdate state for success/error
  useEffect(() => {
    if (updateSuccess) {
      showNotification('Profile updated successfully', 'success');
      dispatch({ type: PROFILE_UPDATE_RESET });
    }
    if (updateError) {
      const isOnboardingServerGate =
        updateErrorCode === 'ONBOARDING_TUTORIAL_REQUIRED';
      showNotification(updateError, isOnboardingServerGate ? 'warning' : 'error');
      if (isOnboardingServerGate) {
        setOpenSection('');
      }
      dispatch({ type: PROFILE_UPDATE_RESET });
    }
  }, [updateSuccess, updateError, updateErrorCode, dispatch]);

  useEffect(() => {
    if (!tutorialUpdateData) return;
    setOnboardingTutorial((prev) => ({
      ...prev,
      ...tutorialUpdateData,
    }));
    dispatch({ type: PROFILE_ONBOARDING_TUTORIAL_UPDATE_RESET });
  }, [tutorialUpdateData, dispatch]);

  useEffect(() => {
    if (!pendingFocusId) return;

    requestAnimationFrame(() => {
      if (pendingFocusId === 'profile-description') {
        descriptionEditorRef.current?.focus();
      } else {
        const element = document.getElementById(pendingFocusId);
        if (element && typeof element.focus === 'function') {
          element.focus();
        }
      }
      setPendingFocusId('');
    });
  }, [openSection, pendingFocusId]);

  // Keep displayed profile image aligned with the latest list.
  useEffect(() => {
    if (!profileImages) return;

    if (profileImages.length === 0) {
      setProfileImage('');
      return;
    }

    const currentStillExists = profileImages.some(
      (img) => img?.avatar && img.avatar === profileImage,
    );

    if (!currentStillExists) {
      setProfileImage(profileImages[0]?.avatar ?? '');
    }
  }, [profileImages, profileImage]);

  useEffect(() => {
    if (!qualificationDocumentUploadSuccess && !qualificationDocumentUploadError) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (qualificationDocumentUploadSuccess) {
        showNotification('Qualification document uploaded successfully', 'success');
        setSelectedQualificationDocument(null);
        setQualificationDocumentValidationError('');
        if (qualificationDocumentInputRef.current) {
          qualificationDocumentInputRef.current.value = '';
        }
      }

      if (qualificationDocumentUploadError) {
        showNotification(qualificationDocumentUploadError, 'error');
      }

      dispatch({ type: QUALIFICATION_DOCUMENT_UPLOAD_RESET });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    qualificationDocumentUploadSuccess,
    qualificationDocumentUploadError,
    dispatch,
  ]);

  useEffect(() => {
    if (!qualificationDocumentReplaceSuccess && !qualificationDocumentReplaceError) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (qualificationDocumentReplaceSuccess) {
        showNotification(
          qualificationDocumentReplaceMessage ||
            'Qualification document replaced successfully',
          'success',
        );
      }

      if (qualificationDocumentReplaceError) {
        showNotification(qualificationDocumentReplaceError, 'error');
      }

      setQualificationDocumentActionTarget({ id: '', type: '' });
      if (qualificationDocumentReplaceInputRef.current) {
        qualificationDocumentReplaceInputRef.current.value = '';
      }

      dispatch({ type: QUALIFICATION_DOCUMENT_REPLACE_RESET });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    qualificationDocumentReplaceSuccess,
    qualificationDocumentReplaceError,
    qualificationDocumentReplaceMessage,
    dispatch,
  ]);

  useEffect(() => {
    if (!qualificationDocumentDeleteSuccess && !qualificationDocumentDeleteError) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (qualificationDocumentDeleteSuccess) {
        showNotification(
          qualificationDocumentDeleteMessage ||
            'Qualification document deleted successfully',
          'success',
        );
      }

      if (qualificationDocumentDeleteError) {
        showNotification(qualificationDocumentDeleteError, 'error');
      }

      setQualificationDocumentActionTarget({ id: '', type: '' });
      dispatch({ type: QUALIFICATION_DOCUMENT_DELETE_RESET });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    qualificationDocumentDeleteSuccess,
    qualificationDocumentDeleteError,
    qualificationDocumentDeleteMessage,
    dispatch,
  ]);

  const handleCreateProfile = () => {
    // Dispatch create profile action
    // After successful creation, the action will fetch the profile
    // and the component will re-render to show the edit form
    dispatch(createProfileAction());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!onboardingTutorial?.isCompleted) {
      showNotification(
        'Complete the onboarding tutorial before saving your profile.',
        'warning',
      );
      return;
    }

    // Validate all required fields before processing
    if (!name || name.trim().length === 0) {
      setOpenSection('basics');
      setPendingFocusId('profile-name');
      showNotification('Name is required', 'error');
      return;
    }

    if (!emailRegEx.test(email)) {
      setOpenSection('basics');
      setPendingFocusId('profile-email');
      showNotification('Valid email address is required', 'error');
      return;
    }

    const normalizedTelephoneNumber = normalizeTelephoneNumber(telephoneNumber);

    if (!telephoneNumberRegEx.test(normalizedTelephoneNumber)) {
      setOpenSection('telephone');
      setPendingFocusId('profile-telephone');
      showNotification('Valid UK telephone number is required', 'error');
      return;
    }

    if (stripHtml(description).length < 10) {
      setOpenSection('description');
      setPendingFocusId('profile-description');
      showNotification(
        `Description must be at least 10 characters (${stripHtml(description).length} entered)`,
        'error',
      );
      return;
    }

    const specialisationTextLength = stripHtml(specialisation).length;
    if (specialisationTextLength > SPECIALISATION_MAX_CHARACTERS) {
      setOpenSection('specialisation');
      showNotification(
        `Specialisation must not exceed ${SPECIALISATION_MAX_CHARACTERS} characters (${specialisationTextLength} entered)`,
        'error',
      );
      return;
    }

    if (location.length < 10) {
      setOpenSection('location');
      setPendingFocusId('location');
      showNotification('Location must be at least 10 characters', 'error');
      return;
    }

    // Validate keywords
    const keywords = [
      keyWordSearchOne,
      keyWordSearchTwo,
      keyWordSearchThree,
      keyWordSearchFour,
      keyWordSearchFive,
    ];
    const invalidKeywords = keywords.filter((k) => k.length < 3);
    if (invalidKeywords.length > 0) {
      setOpenSection('keywords');
      setPendingFocusId('keyword-one');
      showNotification('All keyword fields must be at least 3 characters', 'error');
      return;
    }

    // Validate specializations
    const specializations = [
      specialisationOne,
      specialisationTwo,
      specialisationThree,
      specialisationFour,
    ];
    const invalidSpecs = specializations.filter((s) => s.length < 3);
    if (invalidSpecs.length > 0) {
      setOpenSection('spec-keywords');
      setPendingFocusId('specialisation-one');
      showNotification(
        'All specialisation fields must be at least 3 characters',
        'error',
      );
      return;
    }

    // Dispatch UPDATE PROFILE Action
    // Keywords are now handled server-side automatically
    dispatch(
      profileUpdateAction({
        name,
        email,
        faceBook,
        instagram,
        websiteUrl,
        profileImage,
        description,
        specialisation,
        qualifications,
        location,
        telephoneNumber: normalizedTelephoneNumber,
        keyWordSearchOne,
        keyWordSearchTwo,
        keyWordSearchThree,
        keyWordSearchFour,
        keyWordSearchFive,
        specialisationOne,
        specialisationTwo,
        specialisationThree,
        specialisationFour,
      }),
    );
  };

  const handleTutorialUpdate = (tutorialPayload) => {
    setOnboardingTutorial((prev) => {
      const nextWatchProgressPercent =
        tutorialPayload.watchProgressPercent ?? prev.watchProgressPercent ?? 0;
      const completionThreshold = prev.completionThresholdPercent || 90;
      const nextIsCompleted =
        prev.isCompleted === true ||
        nextWatchProgressPercent >= completionThreshold ||
        tutorialPayload.manualAcknowledged === true;

      return {
        ...prev,
        hasInteracted: true,
        ...tutorialPayload,
        watchProgressPercent: nextWatchProgressPercent,
        isCompleted: nextIsCompleted,
        completedAt:
          tutorialPayload.completedAt || (nextIsCompleted ? prev.completedAt : null),
      };
    });

    dispatch(updateOnboardingTutorialAction(tutorialPayload));
  };

  // Profile image
  const [previewImage, setPreviewImage] = useState('');
  const [previewImageFile, setPreviewImageFile] = useState('');
  const previewFile = (imageFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
  };

  const uploadFileHandler = (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    if (imageFile.size > 5 * 1024 * 1024) {
      showNotification('Image must be less than 5MB', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setPreviewImageFile(imageFile);
    previewFile(imageFile);
  };

  const handleProfileImageUpdate = (e) => {
    e.preventDefault();
    if (!onboardingTutorial?.isCompleted) {
      showNotification(
        'Complete the onboarding tutorial before saving profile images.',
        'warning',
      );
      return;
    }
    const formImageData = new FormData();
    formImageData.append('profileImage', previewImageFile);
    //Dispatch upload action here
    dispatch(profileImageUploadAction(formImageData));
    setPreviewImage('');
  };

  const handleCancelImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewImage('');
    setPreviewImageFile('');
  };

  // USER Profile image

  const handleProfileImageDelete = (id) => {
    // Dispatch PROFILE  delete action
    if (window.confirm(`Are you sure you want to delete image`)) {
      dispatch(deleteProfileImageAction(id));
    }
  };

  const handleHelp = () => {
    setShowHelp(!showHelp);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation helpers
  const isNameValid = name && name.length > 0;
  const isEmailValid = emailRegEx.test(email);
  const isTelephoneValid = telephoneNumberRegEx.test(
    normalizeTelephoneNumber(telephoneNumber),
  );

  // Show errors only after blur
  const showNameError = touched.name && !isNameValid;
  const showEmailError = touched.email && !isEmailValid;
  const showTelephoneError = touched.telephoneNumber && !isTelephoneValid;
  const isTutorialCompleted = onboardingTutorial?.isCompleted === true;
  const saveDisabled = !isTutorialCompleted;
  const specialisationCharacterCount = stripHtml(specialisation || '').length;
  const specialisationTooLong =
    specialisationCharacterCount > SPECIALISATION_MAX_CHARACTERS;
  const tutorialVideoUrl =
    import.meta.env.VITE_ONBOARDING_TUTORIAL_URL || onboardingTutorialVideo;
  const qualificationDocumentList = Array.isArray(qualificationDocuments)
    ? qualificationDocuments
    : [];
  const activeQualificationDocument =
    qualificationDocumentList.find((document) => document?._id === activeDocumentId) ||
    qualificationDocumentList.find((document) => document?.isActive) ||
    null;
  const qualificationDocumentStatus =
    qualificationDocumentProfileStatus ||
    profile?.qualificationVerificationStatus ||
    (profile?.isQualificationsVerified ? 'approved' : 'none');
  const qualificationDocumentStatusLabel = formatQualificationDocumentStatus(
    qualificationDocumentStatus,
  );
  const qualificationStatusMessage = buildQualificationStatusMessage({
    status: qualificationDocumentStatus,
    activeDocument: activeQualificationDocument,
  });
  const qualificationSummaryStatus = buildQualificationSummaryStatus({
    status: qualificationDocumentStatus,
    activeDocument: activeQualificationDocument,
  });
  const qualificationDocumentMutationLoading =
    qualificationDocumentUploadLoading ||
    qualificationDocumentReplaceLoading ||
    qualificationDocumentDeleteLoading;
  const qualificationDocumentSizeInMb = selectedQualificationDocument
    ? (selectedQualificationDocument.size / (1024 * 1024)).toFixed(2)
    : null;

  const validateQualificationDocumentFile = (file) => {
    if (!file) {
      return 'Select a qualification document to continue.';
    }

    if (!ACCEPTED_QUALIFICATION_DOCUMENT_MIME_TYPES.has(file.type)) {
      return 'Only PDF, JPG, and PNG qualification documents are allowed.';
    }

    if (file.size > MAX_QUALIFICATION_DOCUMENT_SIZE_BYTES) {
      return 'Qualification document must be 5MB or less.';
    }

    return '';
  };

  const handleQualificationDocumentSelection = (file) => {
    const validationError = validateQualificationDocumentFile(file);

    if (validationError) {
      setSelectedQualificationDocument(null);
      setQualificationDocumentValidationError(validationError);
      if (qualificationDocumentInputRef.current) {
        qualificationDocumentInputRef.current.value = '';
      }
      return false;
    }

    setSelectedQualificationDocument(file);
    setQualificationDocumentValidationError('');
    return true;
  };

  const handleQualificationDocumentInputChange = (event) => {
    const file = event.target.files?.[0];
    handleQualificationDocumentSelection(file);
  };

  const handleQualificationDocumentBrowse = () => {
    qualificationDocumentInputRef.current?.click();
  };

  const handleQualificationDocumentReplaceBrowse = (documentId) => {
    if (!documentId) return;

    if (!onboardingTutorial?.isCompleted) {
      showNotification(
        'Complete the onboarding tutorial before replacing qualification documents.',
        'warning',
      );
      return;
    }

    setQualificationDocumentActionTarget({
      id: documentId,
      type: 'replace',
    });
    qualificationDocumentReplaceInputRef.current?.click();
  };

  const handleQualificationDocumentDragOver = (event) => {
    event.preventDefault();
    setIsQualificationDragActive(true);
  };

  const handleQualificationDocumentDragLeave = (event) => {
    event.preventDefault();
    setIsQualificationDragActive(false);
  };

  const handleQualificationDocumentDrop = (event) => {
    event.preventDefault();
    setIsQualificationDragActive(false);

    const file = event.dataTransfer?.files?.[0];
    handleQualificationDocumentSelection(file);
  };

  const handleQualificationDocumentKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleQualificationDocumentBrowse();
    }
  };

  const handleQualificationDocumentClear = () => {
    setSelectedQualificationDocument(null);
    setQualificationDocumentValidationError('');
    if (qualificationDocumentInputRef.current) {
      qualificationDocumentInputRef.current.value = '';
    }
  };

  const handleQualificationDocumentUpload = () => {
    if (!onboardingTutorial?.isCompleted) {
      showNotification(
        'Complete the onboarding tutorial before uploading qualification documents.',
        'warning',
      );
      return;
    }

    const validationError = validateQualificationDocumentFile(
      selectedQualificationDocument,
    );
    if (validationError) {
      setQualificationDocumentValidationError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('qualificationDocument', selectedQualificationDocument);

    dispatch(
      uploadQualificationDocumentAction(formData, {
        page: 1,
        limit: 20,
      }),
    );
  };

  const handleQualificationDocumentReplaceChange = (event) => {
    const file = event.target.files?.[0];
    const targetDocumentId = qualificationDocumentActionTarget.id;

    if (!targetDocumentId) {
      if (qualificationDocumentReplaceInputRef.current) {
        qualificationDocumentReplaceInputRef.current.value = '';
      }
      return;
    }

    const validationError = validateQualificationDocumentFile(file);
    if (validationError) {
      setQualificationDocumentValidationError(validationError);
      if (qualificationDocumentReplaceInputRef.current) {
        qualificationDocumentReplaceInputRef.current.value = '';
      }
      return;
    }

    setQualificationDocumentValidationError('');

    const formData = new FormData();
    formData.append('qualificationDocument', file);

    dispatch(
      replaceQualificationDocumentAction(targetDocumentId, formData, {
        page: 1,
        limit: 20,
      }),
    );
  };

  const handleQualificationDocumentDelete = (document) => {
    if (!document?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${document.originalFileName}?`,
    );
    if (!confirmed) return;

    setQualificationDocumentActionTarget({
      id: document._id,
      type: 'delete',
    });

    dispatch(
      deleteQualificationDocumentAction(document._id, {
        page: 1,
        limit: 20,
      }),
    );
  };

  return (
    <>
      {(error || createError) && (
        <Message
          message={error || createError}
          variant="error"
          onDismiss={() => {
            if (error) {
              dispatch({ type: PROFILE_OF_LOGGED_IN_USER_RESET });
            }
          }}
        />
      )}

      {notification.message && (
        <Message
          message={notification.message}
          variant={notification.variant}
          onDismiss={() => setNotification({ message: '', variant: 'error' })}
        />
      )}

      {!profile ? (
        <>
          <fieldset className="fieldSet item">
            <legend>Create a profile</legend>
            {createLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <p>Please click the button below to create a sample profile.</p>
                <p>You will then be able to edit your profile.</p>
                <Button
                  type="submit"
                  
                  text="Create your profile"
                  className="btn"
                  title="Create your profile"
                  disabled={false}
                  onClick={handleCreateProfile}
                ></Button>
              </>
            )}
          </fieldset>
        </>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="profile-edit-wrapper">
          <fieldset className="fieldSet item">
            <legend>
              Update <span>PROFILE</span>{' '}
            </legend>
            <p>
              Please note that the more complete your profile is the better it
              will feature when it is searched.
            </p>

            <Button
              type="button"
              
              text={!showHelp ? 'SHOW HELP' : 'HIDE HELP'}
              className="btn"
              title={!showHelp ? 'SHOW HELP' : 'HIDE HELP'}
              disabled={false}
              onClick={handleHelp}
            ></Button>

            <form noValidate onSubmit={handleSubmit}>
              <FormSectionAccordion
                title="Onboarding Tutorial"
                isOpen={openSection === 'onboarding-tutorial'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'onboarding-tutorial' ? '' : 'onboarding-tutorial',
                  )
                }
              >
                {openSection === 'onboarding-tutorial' ? (
                  <OnboardingTutorial
                    tutorial={onboardingTutorial}
                    onTutorialUpdate={handleTutorialUpdate}
                    isUpdating={tutorialUpdateLoading}
                    updateError={tutorialUpdateError}
                    videoUrl={tutorialVideoUrl}
                    storageKey={
                      profile?._id
                        ? `onboarding-tutorial-last-played-${profile._id}`
                        : 'onboarding-tutorial-last-played'
                    }
                  />
                ) : null}
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Profile Basics"
                isOpen={openSection === 'basics'}
                onToggle={() =>
                  setOpenSection((current) => (current === 'basics' ? '' : 'basics'))
                }
              >
                {showHelp ? (
                  <InfoComponent description="Name that the public will see." />
                ) : null}
                <InputField
                  id="profile-name"
                  label="Name"
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  type="text"
                  name="name"
                  placeholder="Ben Smith"
                  value={name}
                  required
                  hint="Your full professional name as it will appear publicly"
                  className={showNameError ? 'invalid' : isNameValid ? 'entered' : ''}
                  error={showNameError ? `Name field cannot be empty` : null}
                  aria-invalid={showNameError}
                  aria-describedby={showNameError ? 'profile-name-error' : undefined}
                />
                {showHelp ? (
                  <InfoComponent description="Email address the public will see." />
                ) : null}{' '}
                <InputField
                  id="profile-email"
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="ben@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                  hint="Valid email format required (example@domain.com)"
                  className={showEmailError ? 'invalid' : isEmailValid ? 'entered' : ''}
                  error={showEmailError ? `Invalid email address` : null}
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? 'profile-email-error' : undefined}
                />
                <InputField
                  id="profile-facebook"
                  label="Facebook USERNAME"
                  type="text"
                  name="faceBook"
                  value={faceBook}
                  placeholder="fiscalfitness"
                  onChange={(e) => setFaceBook(e.target.value)}
                  hint="Your Facebook username (optional)"
                  className={faceBook.length > 0 ? 'entered' : ''}
                />
                <InputField
                  id="profile-instagram"
                  label="Instagram USERNAME"
                  type="text"
                  name="instagram"
                  value={instagram}
                  placeholder="zachfiscalfitness"
                  onChange={(e) => setInstagram(e.target.value)}
                  hint="Your Instagram username (optional)"
                  className={instagram.length > 0 ? 'entered' : ''}
                />
                <InputField
                  id="profile-website"
                  label="Website URL"
                  type="text"
                  name="websiteUrl"
                  value={websiteUrl}
                  placeholder="zachfiscalfitness.co.uk"
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  hint="Your professional website URL (optional)"
                  className={websiteUrl.length > 0 ? 'entered' : ''}
                />
                <Button
                  type="submit"
                  
                  text="Save profile basics"
                  className="btn sticky-save"
                  title="Save profile basics"
                  disabled={saveDisabled}
                />
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Description"
                isOpen={openSection === 'description'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'description' ? '' : 'description',
                  )
                }
              >
                {stripHtml(description || '').length < 10 ? (
                  <span className="small-text">
                    Description must be at least 10 characters ({stripHtml(description || '').length} entered)
                  </span>
                ) : null}

                <label>Brief Description of yourself </label>
                <QuillEditor
                  id="profile-description"
                  value={description}
                  onChange={setDescription}
                  ref={descriptionEditorRef}
                  className={stripHtml(description || '').length < 10 ? 'invalid' : 'entered'}
                />
                <Button
                  type="submit"
                  
                  text="Save description"
                  className="btn sticky-save"
                  title="Save description"
                  disabled={saveDisabled}
                />
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Search Keyword(s)"
                isOpen={openSection === 'keywords'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'keywords' ? '' : 'keywords',
                  )
                }
              >
                <InputField
                  id="keyword-one"
                  label="Keyword 1"
                  placeholder="e.g., Personal Training"
                  value={keyWordSearchOne}
                  onChange={(e) => setkeyWordSearchOne(e.target.value)}
                  onBlur={() => handleBlur('keyWordSearchOne')}
                  type="text"
                  name="keyWordSearchOne"
                  required
                  hint="Primary search keyword (minimum 3 characters)"
                  className={
                    touched.keyWordSearchOne && keyWordSearchOne?.length < 3
                      ? 'invalid'
                      : keyWordSearchOne?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.keyWordSearchOne && keyWordSearchOne?.length < 3
                      ? `Keyword must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.keyWordSearchOne && keyWordSearchOne?.length < 3}
                />
                <InputField
                  id="keyword-two"
                  label="Keyword 2"
                  placeholder="e.g., Strength Training"
                  value={keyWordSearchTwo}
                  onChange={(e) => setkeyWordSearchTwo(e.target.value)}
                  onBlur={() => handleBlur('keyWordSearchTwo')}
                  type="text"
                  name="keyWordSearchTwo"
                  required
                  hint="Secondary search keyword (minimum 3 characters)"
                  className={
                    touched.keyWordSearchTwo && keyWordSearchTwo?.length < 3
                      ? 'invalid'
                      : keyWordSearchTwo?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.keyWordSearchTwo && keyWordSearchTwo?.length < 3
                      ? `Keyword must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.keyWordSearchTwo && keyWordSearchTwo?.length < 3}
                />
                <InputField
                  id="keyword-three"
                  label="Keyword 3"
                  placeholder="e.g., Nutrition"
                  value={keyWordSearchThree}
                  onChange={(e) => setkeyWordSearchThree(e.target.value)}
                  onBlur={() => handleBlur('keyWordSearchThree')}
                  type="text"
                  name="keyWordSearchThree"
                  required
                  hint="Additional search keyword (minimum 3 characters)"
                  className={
                    touched.keyWordSearchThree && keyWordSearchThree?.length < 3
                      ? 'invalid'
                      : keyWordSearchThree?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.keyWordSearchThree && keyWordSearchThree?.length < 3
                      ? `Keyword must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.keyWordSearchThree && keyWordSearchThree?.length < 3}
                />
                <InputField
                  id="keyword-four"
                  label="Keyword 4"
                  placeholder="e.g., Weight Loss"
                  value={keyWordSearchFour}
                  onChange={(e) => setkeyWordSearchFour(e.target.value)}
                  onBlur={() => handleBlur('keyWordSearchFour')}
                  type="text"
                  name="keyWordSearchFour"
                  required
                  hint="Additional search keyword (minimum 3 characters)"
                  className={
                    touched.keyWordSearchFour && keyWordSearchFour?.length < 3
                      ? 'invalid'
                      : keyWordSearchFour?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.keyWordSearchFour && keyWordSearchFour?.length < 3
                      ? `Keyword must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.keyWordSearchFour && keyWordSearchFour?.length < 3}
                />
                <InputField
                  id="keyword-five"
                  label="Keyword 5"
                  placeholder="e.g., Fitness"
                  value={keyWordSearchFive}
                  onChange={(e) => setkeyWordSearchFive(e.target.value)}
                  onBlur={() => handleBlur('keyWordSearchFive')}
                  type="text"
                  name="keyWordSearchFive"
                  required
                  hint="Additional search keyword (minimum 3 characters)"
                  className={
                    touched.keyWordSearchFive && keyWordSearchFive?.length < 3
                      ? 'invalid'
                      : keyWordSearchFive?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.keyWordSearchFive && keyWordSearchFive?.length < 3
                      ? `Keyword must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.keyWordSearchFive && keyWordSearchFive?.length < 3}
                />
                <Button
                  type="submit"
                  
                  text="Save keywords"
                  className="btn sticky-save"
                  title="Save keywords"
                  disabled={saveDisabled}
                />
                <hr className="style-one" />
                <div className="info-message">
                  <p>
                    Your keywords are automatically indexed for search.
                    Users can search using any of your keywords, and MongoDB's
                    text search will find your profile efficiently.
                  </p>
                </div>
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Specialisation Keyword(s)"
                isOpen={openSection === 'spec-keywords'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'spec-keywords' ? '' : 'spec-keywords',
                  )
                }
              >
                <InputField
                  id="specialisation-one"
                  label="Specialisation 1"
                  placeholder="e.g., Bodybuilding"
                  value={specialisationOne}
                  onChange={(e) => setSpecialisationOne(e.target.value)}
                  onBlur={() => handleBlur('specialisationOne')}
                  type="text"
                  name="specialisationOne"
                  required
                  hint="Primary area of expertise (minimum 3 characters)"
                  className={
                    touched.specialisationOne && specialisationOne?.length < 3
                      ? 'invalid'
                      : specialisationOne?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.specialisationOne && specialisationOne?.length < 3
                      ? `Specialisation must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.specialisationOne && specialisationOne?.length < 3}
                />

                <InputField
                  id="specialisation-two"
                  label="Specialisation 2"
                  placeholder="e.g., Sports Performance"
                  value={specialisationTwo}
                  onChange={(e) => setSpecialisationTwo(e.target.value)}
                  onBlur={() => handleBlur('specialisationTwo')}
                  type="text"
                  name="specialisationTwo"
                  required
                  hint="Secondary area of expertise (minimum 3 characters)"
                  className={
                    touched.specialisationTwo && specialisationTwo?.length < 3
                      ? 'invalid'
                      : specialisationTwo?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.specialisationTwo && specialisationTwo?.length < 3
                      ? `Specialisation must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.specialisationTwo && specialisationTwo?.length < 3}
                />

                <InputField
                  id="specialisation-three"
                  label="Specialisation 3"
                  placeholder="e.g., Rehabilitation"
                  value={specialisationThree}
                  onChange={(e) => setSpecialisationThree(e.target.value)}
                  onBlur={() => handleBlur('specialisationThree')}
                  type="text"
                  name="specialisationThree"
                  required
                  hint="Additional area of expertise (minimum 3 characters)"
                  className={
                    touched.specialisationThree && specialisationThree?.length < 3
                      ? 'invalid'
                      : specialisationThree?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.specialisationThree && specialisationThree?.length < 3
                      ? `Specialisation must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.specialisationThree && specialisationThree?.length < 3}
                />

                <InputField
                  id="specialisation-four"
                  label="Specialisation 4"
                  placeholder="e.g., Youth Training"
                  value={specialisationFour}
                  onChange={(e) => setSpecialisationFour(e.target.value)}
                  onBlur={() => handleBlur('specialisationFour')}
                  type="text"
                  name="specialisationFour"
                  required
                  hint="Additional area of expertise (minimum 3 characters)"
                  className={
                    touched.specialisationFour && specialisationFour?.length < 3
                      ? 'invalid'
                      : specialisationFour?.length >= 3
                      ? 'entered'
                      : ''
                  }
                  error={
                    touched.specialisationFour && specialisationFour?.length < 3
                      ? `Specialisation must contain at least 3 characters`
                      : null
                  }
                  aria-invalid={touched.specialisationFour && specialisationFour?.length < 3}
                />
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Specialisation"
                isOpen={openSection === 'specialisation'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'specialisation' ? '' : 'specialisation',
                  )
                }
              >
                <div className="input-border">
                  <div className="input-border-header">
                    <label>Specialisation</label>
                    <span
                      className={`small-text character-count ${
                        specialisationTooLong ? 'character-count-invalid' : ''
                      }`.trim()}
                    >
                      {specialisationCharacterCount} / {SPECIALISATION_MAX_CHARACTERS} characters
                    </span>
                  </div>
                  <QuillEditor
                    value={specialisation}
                    onChange={setSpecialisation}
                    className={
                      stripHtml(specialisation || '').length < 10 || specialisationTooLong
                        ? 'invalid'
                        : 'entered'
                    }
                  />
                  {specialisationTooLong ? (
                    <p className="validation-error" role="alert">
                      Specialisation must not exceed {SPECIALISATION_MAX_CHARACTERS}{' '}
                      characters ({specialisationCharacterCount} entered)
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  
                  text="Save specialisation"
                  className="btn sticky-save"
                  title="Save specialisation"
                  disabled={saveDisabled}
                />
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Qualifications & Documents"
                isOpen={openSection === 'qualifications'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'qualifications' ? '' : 'qualifications',
                  )
                }
              >
                <div className="input-border">
                  <label>Qualifications</label>
                  <QuillEditor
                    value={qualifications}
                    onChange={setQualifications}
                    className={
                      stripHtml(qualifications || '').length < 10 ? 'invalid' : 'entered'
                    }
                  />
                </div>
                <div className="qualification-documents-section">
                  <div className="qualification-documents-header">
                    <div>
                      <h4>Qualification Document</h4>
                      <p className="small-text">
                        Keep your written qualifications above and your
                        verification document below. Supported formats are PDF,
                        JPG, and PNG up to 5MB.
                      </p>
                    </div>
                    <span
                      className={`qualification-documents-status qualification-documents-status-${qualificationDocumentStatus}`}
                    >
                      {qualificationDocumentStatusLabel}
                    </span>
                  </div>

                  <p className="qualification-documents-copy">
                    One active document can be kept on file for review while
                    previous submissions remain part of your verification
                    history.
                  </p>

                  <div
                    className={`qualification-status-message qualification-status-message-${qualificationStatusMessage.tone}`}
                    role="status"
                    aria-live="polite"
                  >
                    <p className="qualification-status-message-title">
                      Status: {qualificationStatusMessage.title}
                    </p>
                    <p className="qualification-status-message-body">
                      {qualificationStatusMessage.body}
                    </p>
                    {qualificationStatusMessage.meta ? (
                      <p className="qualification-status-message-meta">
                        {qualificationDocumentStatus === 'rejected'
                          ? `Reason: ${qualificationStatusMessage.meta}`
                          : qualificationStatusMessage.meta}
                      </p>
                    ) : null}
                  </div>

                  <div
                    className={`qualification-upload-dropzone ${
                      isQualificationDragActive ? 'drag-active' : ''
                    }`.trim()}
                    role="button"
                    tabIndex={0}
                    onClick={handleQualificationDocumentBrowse}
                    onKeyDown={handleQualificationDocumentKeyDown}
                    onDragOver={handleQualificationDocumentDragOver}
                    onDragEnter={handleQualificationDocumentDragOver}
                    onDragLeave={handleQualificationDocumentDragLeave}
                    onDrop={handleQualificationDocumentDrop}
                    aria-describedby="qualification-document-help"
                  >
                    <input
                      ref={qualificationDocumentReplaceInputRef}
                      id="replaceQualificationDocument"
                      className="sr-only"
                      type="file"
                      name="replaceQualificationDocument"
                      accept={QUALIFICATION_DOCUMENT_ACCEPT_ATTRIBUTE}
                      onChange={handleQualificationDocumentReplaceChange}
                      aria-label="Replace qualification document"
                    />
                    <input
                      ref={qualificationDocumentInputRef}
                      id="qualificationDocument"
                      className="sr-only"
                      type="file"
                      name="qualificationDocument"
                      accept={QUALIFICATION_DOCUMENT_ACCEPT_ATTRIBUTE}
                      onChange={handleQualificationDocumentInputChange}
                      aria-label="Select qualification document"
                    />
                    <p className="qualification-upload-title">
                      Drag and drop your qualification document here
                    </p>
                    <p className="qualification-upload-subtitle">
                      or select a file from your device
                    </p>
                    <Button
                      type="button"
                      
                      text="Choose Document"
                      title="Choose qualification document"
                      disabled={qualificationDocumentMutationLoading}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleQualificationDocumentBrowse();
                      }}
                    />
                    <span
                      id="qualification-document-help"
                      className="field-hint qualification-upload-help"
                    >
                      Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB.
                    </span>
                  </div>

                  {qualificationDocumentValidationError ? (
                    <p className="validation-error" role="alert">
                      {qualificationDocumentValidationError}
                    </p>
                  ) : null}

                  {selectedQualificationDocument ? (
                    <div className="qualification-upload-selection">
                      <div>
                        <p className="qualification-upload-selection-label">
                          Selected document
                        </p>
                        <p>
                          <strong>{selectedQualificationDocument.name}</strong>
                        </p>
                        <p>
                          {selectedQualificationDocument.type || 'Unknown type'}{' '}
                          · {qualificationDocumentSizeInMb} MB
                        </p>
                      </div>
                      <div className="qualification-upload-actions">
                        <Button
                          type="button"
                          
                          text={
                            qualificationDocumentUploadLoading
                              ? 'Uploading...'
                              : 'Upload Qualification'
                          }
                          title="Upload qualification document"
                          disabled={
                            qualificationDocumentMutationLoading || saveDisabled
                          }
                          onClick={handleQualificationDocumentUpload}
                        />
                        <Button
                          type="button"
                          
                          text="Clear Selection"
                          title="Clear selected qualification document"
                          disabled={qualificationDocumentMutationLoading}
                          onClick={handleQualificationDocumentClear}
                        />
                      </div>
                    </div>
                  ) : null}

                  {qualificationDocumentsLoading ? (
                    <LoadingSpinner />
                  ) : qualificationDocumentsError ? (
                    <p className="validation-error" role="alert">
                      {qualificationDocumentsError}
                    </p>
                  ) : (
                    <div className="qualification-documents-overview">
                      <p>
                        Documents on file:{' '}
                        <strong>{qualificationDocumentList.length}</strong>
                      </p>
                      {activeQualificationDocument ? (
                        <>
                          <p>
                            Active submission:{' '}
                            <strong>
                              {activeQualificationDocument.originalFileName}
                            </strong>
                          </p>
                          <p>
                            Submitted:{' '}
                            <strong>
                              {moment(activeQualificationDocument.createdAt).format(
                                'D MMM YYYY',
                              )}
                            </strong>
                          </p>
                        </>
                      ) : (
                        <p>No qualification document uploaded yet.</p>
                      )}
                    </div>
                  )}

                  {qualificationDocumentList.length > 0 ? (
                    <div className="qualification-documents-list">
                      <h5>Uploaded Files</h5>
                      {qualificationDocumentList.map((document) => {
                        const uploadedAt =
                          document.createdAt || document.uploadedAt || null;
                        const isActiveDocument =
                          document?._id === activeDocumentId || document?.isActive;
                        const isReplacingThisDocument =
                          qualificationDocumentActionTarget.type === 'replace' &&
                          qualificationDocumentActionTarget.id === document?._id &&
                          qualificationDocumentReplaceLoading;
                        const isDeletingThisDocument =
                          qualificationDocumentActionTarget.type === 'delete' &&
                          qualificationDocumentActionTarget.id === document?._id &&
                          qualificationDocumentDeleteLoading;

                        return (
                          <article
                            key={document?._id}
                            className={`qualification-document-card ${
                              isActiveDocument ? 'is-active' : ''
                            }`.trim()}
                          >
                            <div className="qualification-document-card-header">
                              <div className="qualification-document-file">
                                <p className="qualification-document-file-name">
                                  {document?.originalFileName}
                                </p>
                                <p>
                                  Uploaded:{' '}
                                  <strong>
                                    {uploadedAt
                                      ? moment(uploadedAt).format('D MMM YYYY')
                                      : 'Unknown'}
                                  </strong>
                                </p>
                              </div>
                              <div className="qualification-document-badges">
                                <span
                                  className={`qualification-document-badge ${
                                    isActiveDocument
                                      ? 'qualification-document-badge-active'
                                      : 'qualification-document-badge-history'
                                  }`.trim()}
                                >
                                  {isActiveDocument ? 'Active Submission' : 'Superseded'}
                                </span>
                                <span
                                  className={`qualification-document-badge qualification-document-badge-status qualification-documents-status-${document?.status || 'none'}`}
                                >
                                  {formatQualificationDocumentStatus(document?.status)}
                                </span>
                              </div>
                            </div>
                            <div className="qualification-document-card-actions">
                              <Button
                                type="button"
                                
                                text={
                                  isReplacingThisDocument ? 'Replacing...' : 'Replace'
                                }
                                title={
                                  isActiveDocument
                                    ? 'Replace this qualification document'
                                    : 'Only the active submission can be replaced'
                                }
                                disabled={
                                  !isActiveDocument ||
                                  qualificationDocumentMutationLoading ||
                                  saveDisabled
                                }
                                onClick={() =>
                                  handleQualificationDocumentReplaceBrowse(
                                    document?._id,
                                  )
                                }
                              />
                              <Button
                                type="button"
                                
                                text={isDeletingThisDocument ? 'Deleting...' : 'Delete'}
                                title="Delete this qualification document"
                                disabled={qualificationDocumentMutationLoading}
                                onClick={() =>
                                  handleQualificationDocumentDelete(document)
                                }
                              />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  
                  text="Save qualifications"
                  className="btn sticky-save"
                  title="Save qualifications"
                  disabled={saveDisabled}
                />
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Location"
                isOpen={openSection === 'location'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'location' ? '' : 'location',
                  )
                }
              >
                <div className="textarea-wrapper">
                  <label htmlFor="location">Location</label>
                  <textarea
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    name="location"
                    required
                    placeholder="Enter your detailed location (city, region, etc.)"
                    className={location?.length < 10 ? 'invalid' : 'entered'}
                    aria-invalid={location?.length < 10}
                    aria-describedby={
                      location?.length < 10 ? 'location-error' : undefined
                    }
                  />
                  {location?.length < 10 && location.length > 0 && (
                    <p id="location-error" className="validation-error" role="alert">
                      Location must be at least 10 characters ({location.length} entered)
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  
                  text="Save location"
                  className="btn sticky-save"
                  title="Save location"
                  disabled={saveDisabled}
                />
              </FormSectionAccordion>
              <FormSectionAccordion
                title="Telephone Number"
                isOpen={openSection === 'telephone'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'telephone' ? '' : 'telephone',
                  )
                }
              >
                <InputField
                  id="profile-telephone"
                  label="Telephone Number"
                  value={telephoneNumber}
                  onChange={(e) => setTelephoneNumber(e.target.value)}
                  onBlur={() => handleBlur('telephoneNumber')}
                  type="tel"
                  name="telephoneNumber"
                  placeholder="07xxx xxxxxx"
                  required
                  hint="UK mobile: 07xxx xxxxxx or 447xxx xxxxxx"
                  className={showTelephoneError ? 'invalid' : isTelephoneValid ? 'entered' : ''}
                  error={
                    showTelephoneError
                      ? `Invalid UK mobile number. Use format: 07xxx xxxxxx or 447xxx xxxxxx`
                      : null
                  }
                  aria-invalid={showTelephoneError}
                  aria-describedby={
                    showTelephoneError ? 'profile-telephone-error' : undefined
                  }
                />
              </FormSectionAccordion>
            </form>
          </fieldset>

          {/* This is the display */}

          <fieldset className="fieldSet item">
            <legend>Profile</legend>
            <h3>Profile Summary</h3>

            <div className="summary-wrapper">
              <div>
                <p>Name: {name}</p>
                <p>
                  Email:{' '}
                  <a href={`mailto: ${email}`} target="_blank" rel="noreferrer">
                    {email}
                  </a>
                </p>
                <p>Mobile: {telephoneNumber}</p>
                {!faceBook && !instagram ? (
                  <p>Social media not set.</p>
                ) : (
                  <>
                    <div>
                      {faceBook ? (
                        <FaceBookComponent faceBookUserName={faceBook} />
                      ) : null}

                      {instagram ? (
                        <InstagramComponent instagramUserName={instagram} />
                      ) : null}
                    </div>
                  </>
                )}

                <p>Create: {moment(profile?.createdAt).fromNow()}</p>
                <p>Updated: {moment(profile?.updatedAt).fromNow()}</p>
              </div>
              {profileImageLoading ? <LoadingSpinner /> : null}
              {profileImage ? (
                <img src={profileImage} alt={name} className="image" />
              ) : (
                <p>No profile image</p>
              )}
              <form onSubmit={handleProfileImageUpdate}>
                <div className="file-input-wrapper">
                  <label htmlFor="profileImage">Change Profile Image</label>
                  <input
                    ref={fileInputRef}
                    id="profileImage"
                    type="file"
                    name="profileImage"
                    onChange={uploadFileHandler}
                    accept="image/jpeg,image/png,image/webp"
                    aria-describedby="image-requirements"
                  />
                  <span id="image-requirements" className="field-hint">
                    Supported formats: JPG, PNG, WebP. Maximum size: 5MB
                  </span>
                </div>
                {previewImage ? (
                  <div className="image-preview-wrapper">
                    <p>Image Preview</p>
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      style={{ width: '120px' }}
                    />
                    <div className="button-group">
                      <Button
                        
                        text="Upload Image"
                        className="btn"
                        type="submit"
                        disabled={profileImageLoading || saveDisabled}
                      />
                      <Button
                        
                        text="Cancel"
                        className="btn"
                        type="button"
                        onClick={handleCancelImageUpload}
                        disabled={profileImageLoading}
                      />
                    </div>
                  </div>
                ) : null}
              </form>
            </div>

            <h3>ALL your Profile Images</h3>
            <div className="profile-images-wrapper">
              {profileImagesError ? (
                <p>There was an error loading images</p>
              ) : null}
              {profileImages ? (
                profileImages.map((image) => (
                  <div key={image?._id} className="profile-image-container">
                    <button
                      type="button"
                      className="profile-image-delete"
                      onClick={() => handleProfileImageDelete(image?._id)}
                      aria-label={`Delete image ${image?._id}`}
                      title="Delete this image"
                    >
                      <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                    <img
                      src={image?.avatar}
                      className="profile-image-size"
                      alt={`Profile image ${image?._id}`}
                    />
                  </div>
                ))
              ) : (
                <p>No profile image</p>
              )}
            </div>
            <h3>Description</h3>
            <div className="summary-wrapper">
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitize(description),
                }}
              ></p>
            </div>
            <h3>Location</h3>
            <div className="summary-wrapper">
              <p>{location}</p>
            </div>
            <h3>Specialisation</h3>
            <div className="summary-wrapper">
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitize(specialisation),
                }}
              ></p>
            </div>
            <h3>Qualifications</h3>
            <div className="summary-wrapper">
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitize(qualifications),
                }}
              ></p>
              <div
                className="qualification-summary-status"
                role="status"
                aria-live="polite"
              >
                <p className="status-label">Qualification Status</p>
                <p className="status-item">
                  <i
                    className={`fa ${qualificationSummaryStatus.icon} status-icon ${qualificationSummaryStatus.tone}`}
                    aria-hidden="true"
                  ></i>
                  <span
                    className={`status-text ${qualificationSummaryStatus.tone}`}
                  >
                    {qualificationSummaryStatus.label}
                  </span>
                </p>
                <p className="status-detail">
                  {qualificationSummaryStatus.detail}
                </p>
              </div>
            </div>
            <h3>Rating</h3>
            <div className="summary-wrapper">
              <Rating
                value={profile?.rating}
                text={`  from ${profile?.numReviews} reviews`}
              />
            </div>
          </fieldset>
        </div>
      )}
    </>
  );
};

export default ProfileEditView;
