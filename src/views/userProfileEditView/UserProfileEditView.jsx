import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './UserProfileEditView.scss';

import {
  getUserDetailsAction,
  updateUserProfileAction,
} from '../../store/actions/userActions';
import { USER_UPDATE_PROFILE_RESET } from '../../store/constants/userConstants';
import { profileOfLoggedInUserAction } from '../../store/actions/profileActions';
import { userProfileImageUploadAction } from '../../store/actions/imageUploadActions';

import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Message from '../../components/message/Message';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import LinkComp from '../../components/linkComp/LinkComp';
import PasswordStrength from '../../components/passwordStrength/PasswordStrength';
import FormSectionAccordion from '../../components/formSectionAccordion/FormSectionAccordion';
import { isValidName, isValidEmail, isValidPassword } from '../../utils/validation';

const UserProfileEditView = () => {
  const nameRegEx = /^([\w])+\s+([\w\s])+$/i;
  const emailRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  // Fixed: Password regex now matches error message - alphanumeric only
  const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
  const passwordConfirmRegEx =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logged in user Details saved in local storage
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // User details in DB
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  // Profile details in DB
  const profileState = useSelector((state) => state.profileOfLoggedInUser);
  const { profile } = profileState;

  // USER Profile image upload
  const userProfileImage = useSelector((state) => state.userProfileImage);
  const { loading: userProfileImageLoading } = userProfileImage;

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openSection, setOpenSection] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [pendingFocusId, setPendingFocusId] = useState('');

  // Touched state for blur-triggered validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    currentPassword: false,
    password: false,
    confirmPassword: false,
  });

  // Consolidated message state with variant support
  const [notification, setNotification] = useState({
    text: '',
    variant: 'error',
    visible: false,
  });

  // Image upload state
  const [previewImage, setPreviewImage] = useState('');
  const [previewImageFile, setPreviewImageFile] = useState('');

  // Ref for file input (replaces document.querySelector)
  const fileInputRef = useRef(null);

  // Helper function to show notifications
  const showNotification = (text, variant = 'error') => {
    setNotification({
      text,
      variant,
      visible: true,
    });
  };

  // Helper function to handle blur events
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation helpers
  const isNameValid = nameRegEx.test(name);
  const isEmailValid = emailRegEx.test(email);
  const hidePassword = openSection !== 'password';
  const isPasswordValid = !hidePassword && password.length > 0 ? passwordRegEx.test(password) : true;
  const isConfirmValid = !hidePassword && confirmPassword.length > 0 ? password === confirmPassword && passwordRegEx.test(confirmPassword) : true;

  // Show errors only after blur
  const showNameError = touched.name && !isNameValid && name.length !== 0;
  const showEmailError = touched.email && !isEmailValid && email.length !== 0;
  const showPasswordError = touched.password && !isPasswordValid && password.length > 0;
  const showConfirmError = touched.confirmPassword && !isConfirmValid && confirmPassword.length > 0;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      if (!user || !user.name) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetailsAction(userInfo._id));
      } else {
        if (user.isConfirmed === false) {
          showNotification(
            'In order to update your profile you will need to confirm your email address. This can be done by referring back to the email you received when you first registered.',
            'warning'
          );
        }
        setName(user.name);
        setEmail(user.email);
      }
    }
    dispatch(profileOfLoggedInUserAction());

    const abortConst = new AbortController();
    return () => {
      abortConst.abort();
      console.log('useEffect cleaned UserProfileEditView');
    };
  }, [dispatch, navigate, user, userInfo]);

  useEffect(() => {
    if (!pendingFocusId) return;

    requestAnimationFrame(() => {
      const element = document.getElementById(pendingFocusId);
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
      setPendingFocusId('');
    });
  }, [openSection, pendingFocusId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submit
    if (!isValidName(name)) {
      setOpenSection('basics');
      setPendingFocusId('user-name');
      showNotification('Please enter a valid name (2-100 characters, letters, spaces, hyphens and apostrophes only)', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      setOpenSection('basics');
      setPendingFocusId('user-email');
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Check if email has changed
    const emailHasChanged = email !== user.email;

    // Only validate password if password section is shown and password is entered
    if (!hidePassword && (password.length > 0 || confirmPassword.length > 0)) {
      // Require current password when changing password
      if (!currentPassword || currentPassword.length === 0) {
        setOpenSection('password');
        setPendingFocusId('user-current-password');
        showNotification('Current password is required to change your password', 'error');
        return;
      }

      if (!isValidPassword(password)) {
        setOpenSection('password');
        setPendingFocusId('user-password');
        showNotification('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)', 'error');
        return;
      }

      if (password !== confirmPassword) {
        setOpenSection('password');
        setPendingFocusId('user-confirm-password');
        showNotification('Passwords do not match', 'error');
        return;
      }
    }

    // Check user confirmation
    if (user.isConfirmed !== true) {
      showNotification(
        'You have not yet confirmed your email. Please check your emails.',
        'warning'
      );
      return;
    }

    // Build update object
    const updateData = {
      id: user._id,
      name,
      email,
    };

    // Add password fields if changing password
    if (!hidePassword && password.length > 0) {
      updateData.password = password;
      updateData.currentPassword = currentPassword;
    }

    // Dispatch update
    dispatch(updateUserProfileAction(updateData));

    // Show appropriate success message
    if (emailHasChanged) {
      showNotification('Profile updated. Please check your email to verify your new email address.', 'success');
      setEmailChanged(true);
    } else {
      showNotification('Profile updated successfully!', 'success');
    }

    // Clear password fields
    if (!hidePassword) {
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setOpenSection('');
    }
  };

  // USER Profile image
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
      setOpenSection('image');
      setPendingFocusId('userProfileImage');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    setPreviewImageFile(imageFile);
    previewFile(imageFile);
  };

  const handleUserProfileImageUpdate = (e) => {
    e.preventDefault();
    if (!previewImageFile) {
      showNotification('Please choose an image before uploading', 'error');
      setOpenSection('image');
      setPendingFocusId('userProfileImage');
      return;
    }
    const formImageData = new FormData();
    formImageData.append('userProfileImage', previewImageFile);
    //Dispatch upload action here
    dispatch(userProfileImageUploadAction(formImageData));
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
  // PROFILE image

  // PROFILE image

  return (
    <div className="user-profile-wrapper">
      {error && <Message message={error} variant="error" />}
      {notification.visible && (
        <Message
          message={notification.text}
          variant={notification.variant}
          isVisible={notification.visible}
          onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
        />
      )}

      {loading || !user ? (
        <div role="status" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
          <span className="sr-only">Loading user profile...</span>
        </div>
      ) : (
        <>
          <fieldset className="fieldSet item">
            <legend>
              UPDATE <span>USER</span>
            </legend>
            <form onSubmit={handleSubmit}>
              <FormSectionAccordion
                title="Account Basics"
                isOpen={openSection === 'basics'}
                onToggle={() =>
                  setOpenSection((current) => (current === 'basics' ? '' : 'basics'))
                }
              >
                <InputField
                  id="user-name"
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  type="text"
                  name="name"
                  required
                  hint="First and last name required"
                  className={showNameError ? 'invalid' : isNameValid && name.length > 0 ? 'entered' : ''}
                  error={showNameError ? `Name must contain a first name and surname both of which must start with a capital letter.` : null}
                  aria-invalid={showNameError}
                  aria-describedby={showNameError ? 'user-name-error' : undefined}
                />
                <InputField
                  id="user-email"
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                  hint="Valid email format required"
                  className={showEmailError ? 'invalid' : isEmailValid && email.length > 0 ? 'entered' : ''}
                  error={showEmailError ? `Invalid email address.` : null}
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? 'user-email-error' : undefined}
                />
              </FormSectionAccordion>

              <FormSectionAccordion
                title="Password Settings"
                isOpen={openSection === 'password'}
                onToggle={() =>
                  setOpenSection((current) => (current === 'password' ? '' : 'password'))
                }
              >
                <div className="password-section" role="region" aria-label="Password settings">
                  <InputField
                    id="user-current-password"
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={currentPassword}
                    required={!hidePassword}
                    hint="Enter your current password to change it"
                    className={currentPassword.length > 0 ? 'entered' : ''}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onBlur={() => handleBlur('currentPassword')}
                  />

                  <InputField
                    id="user-password"
                    label="New Password"
                    type="password"
                    name="password"
                    value={password}
                    required={!hidePassword}
                    hint="8+ characters: uppercase, lowercase, number, and special character (@$!%*?&)"
                    className={password.length > 0 && !isValidPassword(password) ? 'invalid' : password.length > 0 ? 'entered' : ''}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                  />

                  {password.length > 0 && <PasswordStrength password={password} />}

                  <InputField
                    id="user-confirm-password"
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    required={!hidePassword}
                    hint="Must match new password field exactly"
                    className={confirmPassword.length > 0 && !isValidPassword(confirmPassword) ? 'invalid' : confirmPassword.length > 0 ? 'entered' : ''}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                  />

                  {confirmPassword.length > 0 && (
                    <div
                      className={
                        password === confirmPassword
                          ? 'password-match'
                          : 'password-mismatch'
                      }
                    >
                      {password === confirmPassword
                        ? '\u2713 Passwords match'
                        : '\u2717 Passwords do not match'}
                    </div>
                  )}
                </div>
              </FormSectionAccordion>
              {openSection ? (
                <Button
                  type="submit"
                  
                  text="Update Profile"
                  className="btn"
                  title={!user.isConfirmed ? 'You must confirm your email before updating your profile' : null}
                  disabled={!user.isConfirmed}
                />
              ) : null}
            </form>
          </fieldset>

          <fieldset className="fieldSet item">
            <legend>
              {' '}
              <span>USER</span> SUMMARY: {user.name}
            </legend>
            <span className="small-text">ID: {user._id}</span>
            {userProfileImageLoading ? <LoadingSpinner /> : null}
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="image" />
            ) : (
              <p>No profile image</p>
            )}

            <FormSectionAccordion
              title="Profile Image"
              isOpen={openSection === 'image'}
              onToggle={() =>
                setOpenSection((current) => (current === 'image' ? '' : 'image'))
              }
            >
              <form onSubmit={handleUserProfileImageUpdate}>
                <div className="file-input-wrapper">
                  <label htmlFor="userProfileImage" className="file-input-label">
                    Change User Profile Image
                  </label>
                  <input
                    ref={fileInputRef}
                    id="userProfileImage"
                    type="file"
                    name="userProfileImage"
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
                    <h3>Image Preview</h3>
                    <img
                      src={previewImage}
                      alt="Preview of new profile image"
                      className="preview-image"
                    />
                    <div className="button-group">
                      <Button
                        type="submit"
                        
                        text="Upload Image"
                        className="btn"
                        disabled={userProfileImageLoading}
                      />
                      <Button
                        type="button"
                        
                        text="Cancel"
                        className="btn"
                        onClick={handleCancelImageUpload}
                        disabled={userProfileImageLoading}
                      />
                    </div>
                  </div>
                ) : null}
              </form>
            </FormSectionAccordion>

            <p>Name: {user.name}</p>
            <p>Email address: {user.email}</p>
            <p className="status-item">
              <span className="label">Confirmed User:</span>
              <span className={`status-indicator ${user.isConfirmed ? 'confirmed' : 'not-confirmed'}`}>
                <i
                  className={user.isConfirmed ? 'fa fa-check' : 'fa fa-times'}
                  aria-hidden="true"
                />
                <span className="status-text">
                  {user.isConfirmed ? 'Confirmed' : 'Not Confirmed'}
                </span>
              </span>
            </p>
            <p className="status-item">
              <span className="label">Admin:</span>
              <span className={`status-indicator ${user.isAdmin ? 'confirmed' : 'not-confirmed'}`}>
                <i
                  className={user.isAdmin ? 'fa fa-check' : 'fa fa-times'}
                  aria-hidden="true"
                />
                <span className="status-text">
                  {user.isAdmin ? 'Administrator' : 'User'}
                </span>
              </span>
            </p>
          </fieldset>

          {user.isAdmin ? (
            <fieldset className="fieldSet item">
              <legend>{user.name} Options</legend>
              <h3>Admin Options</h3>
              <ul className="admin-options">
                <li>
                  List all <LinkComp route="admin-users" routeName="USERS" /> with
                  an option to edit or delete a user.
                </li>
                <li>
                  List all <LinkComp route="admin-profiles" routeName="PROFILES" /> with
                  an option to edit or delete a user.
                </li>
                <li>
                  List all <LinkComp route="admin-reviewers" routeName="REVIEWERS" /> with
                  an option to edit or delete a user.
                </li>
                <li>Verify qualification</li>
              </ul>
            </fieldset>
          ) : null}

          <fieldset className="fieldSet item">
            <legend>
              UPDATE <span>PROFILE</span>
            </legend>
            <p>
              Click <LinkComp route="profile-edit" routeName="here" /> to edit
              your profile.
            </p>
          </fieldset>
          <fieldset className="fieldSet item">
            <legend>
              <span>PROFILE</span> Statistics
            </legend>
            <p>
              Your profile has been Clicked{' '}
              <span className="profile-click-count">
                {profile?.profileClickCounter}
              </span>{' '}
              times.
            </p>
            <p>Time spent on viewing your profile</p>
          </fieldset>
        </>
      )}
    </div>
  );
};

export default UserProfileEditView;
