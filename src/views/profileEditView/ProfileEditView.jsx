import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './ProfileEditView.scss';

import {
  profileOfLoggedInUserAction,
  createProfileAction,
  profileUpdateAction,
  profileImagesAction,
} from '../../store/actions/profileActions';

import {
  profileImageUploadAction,
  deleteProfileImageAction,
} from '../../store/actions/imageUploadActions';

import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Message from '../../components/message/Message';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Rating from '../../components/rating/Rating';

import moment from 'moment';
import QuillEditor from '../../components/quillEditor/QuillEditor';
import DOMPurify from 'dompurify';
import FaceBookComponent from '../../components/socialMedia/faceBook/FaceBookComponent';
import InstagramComponent from '../../components/socialMedia/Instagram/InstagramComponent';
import InfoComponent from '../../components/info/InfoComponent';

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

const ProfileEditView = () => {
  const emailRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  const telephoneNumberRegEx = /^(07[\d]{8,12}|447[\d]{7,11})$/;

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

  // PROFILE images
  const profileImagesState = useSelector((state) => state.profileImages);
  const { error: profileImagesError, profileImages } = profileImagesState;

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

  // Refs
  const fileInputRef = useRef(null);

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
    }

    dispatch(profileImagesAction());

    const abortConst = new AbortController();
    return () => {
      abortConst.abort();
      console.log('ProfileEditView useEffect cleaned');
    };
  }, [navigate, dispatch, userInfo, profile]);

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

  const handleCreateProfile = () => {
    // Dispatch create profile action
    // After successful creation, the action will fetch the profile
    // and the component will re-render to show the edit form
    dispatch(createProfileAction());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields before processing
    if (!name || name.trim().length === 0) {
      showNotification('Name is required', 'error');
      return;
    }

    if (!emailRegEx.test(email)) {
      showNotification('Valid email address is required', 'error');
      return;
    }

    if (!telephoneNumberRegEx.test(telephoneNumber)) {
      showNotification('Valid UK telephone number is required', 'error');
      return;
    }

    if (description.length < 10) {
      showNotification('Description must be at least 10 characters', 'error');
      return;
    }

    if (location.length <= 10) {
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
        telephoneNumber,
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
    showNotification('Profile updated successfully', 'success');
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
    setPreviewImageFile(imageFile);
    previewFile(imageFile);
  };

  const handleProfileImageUpdate = (e) => {
    e.preventDefault();
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

  const showNotification = (message, variant = 'error') => {
    setNotification({ message, variant });
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation helpers
  const isNameValid = name && name.length > 0;
  const isEmailValid = emailRegEx.test(email);
  const isTelephoneValid = telephoneNumberRegEx.test(telephoneNumber);

  // Show errors only after blur
  const showNameError = touched.name && !isNameValid;
  const showEmailError = touched.email && !isEmailValid;
  const showTelephoneError = touched.telephoneNumber && !isTelephoneValid;

  return (
    <>
      {(error || createError) && (
        <Message
          message={error || createError}
          variant="error"
          onDismiss={() => setNotification({ message: '', variant: 'error' })}
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
                  colour="transparent"
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
              colour="transparent"
              text={!showHelp ? 'SHOW HELP' : 'HIDE HELP'}
              className="btn"
              title={!showHelp ? 'SHOW HELP' : 'HIDE HELP'}
              disabled={false}
              onClick={handleHelp}
            ></Button>

            <form onSubmit={handleSubmit}>
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
                colour="transparent"
                text="Save profile basics"
                className="btn sticky-save"
                title="Save profile basics"
                disabled={false}
              />
              <div>
                <h3>Description </h3>
                {description?.length < 10 ? (
                  <span className="small-text">
                    Description must have at least {description.length}{' '}
                    characters.
                  </span>
                ) : null}

                <div className="input-wrapper">
                  <label>Brief Description of yourself </label>
                  <QuillEditor
                    value={description}
                    onChange={setDescription}
                    className={description?.length < 10 ? 'invalid' : 'entered'}
                  />
                </div>
                <Button
                  type="submit"
                  colour="transparent"
                  text="Save description"
                  className="btn sticky-save"
                  title="Save description"
                  disabled={false}
                />
              </div>
              
              <div>
                <h3>Search Keyword(s)</h3>
                <div className="input-wrapper">
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
                    colour="transparent"
                    text="Save keywords"
                    className="btn sticky-save"
                    title="Save keywords"
                    disabled={false}
                  />
                  <div>
                    <hr className="style-one" />
                    <div className="info-message">
                      <p>
                        Your keywords are automatically indexed for search.
                        Users can search using any of your keywords, and MongoDB's
                        text search will find your profile efficiently.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3>Specialisation Keyword(s)</h3>
                <div className="input-wrapper">
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
                </div>
              </div>
              <div>
                <h3>Specialisation</h3>
                <div className="input-border">
                  <label>Specialisation</label>
                  <QuillEditor
                    value={specialisation}
                    onChange={setSpecialisation}
                    className={
                      specialisation?.length < 10 ? 'invalid' : 'entered'
                    }
                  />
                </div>
                <Button
                  type="submit"
                  colour="transparent"
                  text="Save specialisation"
                  className="btn sticky-save"
                  title="Save specialisation"
                  disabled={false}
                />
              </div>
              <div>
                <h3>Qualifications</h3>
                <div className="input-border">
                  <label>Qualifications</label>
                  <QuillEditor
                    value={qualifications}
                    onChange={setQualifications}
                    className={
                      qualifications?.length < 10 ? 'invalid' : 'entered'
                    }
                  />
                </div>
                <Button
                  type="submit"
                  colour="transparent"
                  text="Save qualifications"
                  className="btn sticky-save"
                  title="Save qualifications"
                  disabled={false}
                />
              </div>
              <div>
                <h3>Location</h3>
                <div className="textarea-wrapper">
                  <label htmlFor="location">Location</label>
                  <textarea
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    name="location"
                    required
                    placeholder="Enter your detailed location (city, region, etc.)"
                    className={location?.length <= 10 ? 'invalid' : 'entered'}
                    aria-invalid={location?.length <= 10}
                    aria-describedby={
                      location?.length <= 10 ? 'location-error' : undefined
                    }
                  />
                  {location?.length <= 10 && location.length > 0 && (
                    <p id="location-error" className="validation-error" role="alert">
                      Location must be at least 10 characters ({location.length} entered)
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  colour="transparent"
                  text="Save location"
                  className="btn sticky-save"
                  title="Save location"
                  disabled={false}
                />
              </div>
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
                <p>'No profile image'</p>
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
                        colour="transparent"
                        text="Upload Image"
                        className="btn"
                        type="submit"
                        disabled={profileImageLoading}
                      />
                      <Button
                        colour="transparent"
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
                <p>'No profile image'</p>
              )}
            </div>
            <h3>Description</h3>
            <div className="summary-wrapper">
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitize(profile?.description),
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
                  __html: sanitize(profile?.specialisation),
                }}
              ></p>
            </div>
            <h3>Qualifications</h3>
            <div className="summary-wrapper">
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitize(profile?.qualifications),
                }}
              ></p>
              <p className="status-item">
                QualificationsVerified:{' '}
                {profile.isQualificationsVerified === true ? (
                  <>
                    <i className="fa fa-check status-icon confirmed" aria-hidden="true"></i>
                    <span className="status-text">Verified</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-times status-icon not-confirmed" aria-hidden="true"></i>
                    <span className="status-text">Not Verified</span>
                  </>
                )}
              </p>
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
