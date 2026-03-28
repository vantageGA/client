import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './FullProfileView.scss';

import {
  profileByIdAction,
  profileImagesPublicAction,
} from '../../store/actions/profileActions';
import { userReviewIdAction } from '../../store/actions/userReviewActions';

import Message from '../../components/message/Message';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import ImageTooltip from '../../components/imageTooltip/ImageTooltip';
import LinkComp from '../../components/linkComp/LinkComp';
import Rating from '../../components/rating/Rating';
import Review from '../../components/review/Review';

import moment from 'moment';
import DOMPurify from 'dompurify';

import FaceBookComponent from '../../components/socialMedia/faceBook/FaceBookComponent';
import InstagramComponent from '../../components/socialMedia/Instagram/InstagramComponent';
import verifiedBadge from '../../assets/images/verified-badge.png';

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

const getPublicQualificationVerificationState = (profile) => {
  const status = (profile?.qualificationVerificationStatus || '')
    .toString()
    .trim()
    .toLowerCase();

  if (status === 'approved') {
    return { isVerified: true, label: 'Verified' };
  }

  if (status === 'pending') {
    return { isVerified: false, label: 'Pending review' };
  }

  if (status === 'rejected') {
    return { isVerified: false, label: 'Not verified' };
  }

  return {
    isVerified: profile?.isQualificationsVerified === true,
    label: profile?.isQualificationsVerified === true ? 'Verified' : 'Not verified',
  };
};

const ProfileImagePicker = ({ images, loading, error, children }) => {
  const [profileImageIndex, setProfileImageIndex] = useState(0);
  const activeProfileImageIndex = images[profileImageIndex]
    ? profileImageIndex
    : 0;
  const selectedProfileImage =
    images[activeProfileImageIndex] ?? images[0] ?? null;

  return children({
    activeProfileImageIndex,
    error,
    handleProfileImage: setProfileImageIndex,
    images,
    loading,
    selectedProfileImage,
  });
};

const FullProfileView = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const profileState = useSelector((state) => state.profileById);
  const { loading, error, profile } = profileState;

  useEffect(() => {
    dispatch(profileByIdAction(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (profile?.user) {
      dispatch(profileImagesPublicAction(profile.user));
      dispatch(userReviewIdAction(profile.user));
    }
  }, [dispatch, profile?.user]);

  const profileImagesPublic = useSelector((state) => state.profileImagesPublic);
  const {
    loading: profileImageLoading,
    profileImages: publicProfileImages = [],
    error: profileImageError,
  } = profileImagesPublic;

  // Note: For now showing first page of images only
  // In a future enhancement, could add pagination controls for images

  // Filter empty specialisations
  const specialisations = [
    profile?.specialisationOne,
    profile?.specialisationTwo,
    profile?.specialisationThree,
    profile?.specialisationFour
  ].filter((s) => s && s.trim());
  const reviews = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const reviewCount =
    typeof profile?.numReviews === 'number' ? profile.numReviews : reviews.length;
  const qualificationVerification = getPublicQualificationVerificationState(profile);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error ? (
            <Message message={error} />
          ) : (
            <>
              {specialisations.length > 0 && (
                <section
                  className="profile-specialisation-header"
                  aria-label="Professional specialisations"
                >
                  <h2 className="sr-only">Specialisations</h2>
                  <div className="specialisation-tags-container">
                    {specialisations.map((spec, index) => (
                      <span key={index} className="specialisation-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              <ProfileImagePicker
                key={profile?.user || id}
                images={publicProfileImages}
                loading={profileImageLoading}
                error={profileImageError}
              >
                {({
                  activeProfileImageIndex,
                  error: galleryError,
                  handleProfileImage,
                  images,
                  loading: galleryLoading,
                  selectedProfileImage,
                }) => (
                  <div className="full-profile-wrapper">
                    <div className="item first-column">
                      <div>
                        <h1 className="full-profile-name">{profile?.name}</h1>
                        <Rating
                          value={profile?.rating}
                          text={`  from ${reviewCount} reviews`}
                        />
                      </div>

                      <div
                        className="bg-image"
                        style={{
                          backgroundImage: selectedProfileImage?.avatar
                            ? `url(${selectedProfileImage.avatar})`
                            : null,
                        }}
                      ></div>

                      <div className="full-profile-time">
                        <p>
                          {profile?.name} has had {profile?.profileClickCounter ?? 0}{' '}
                          views.
                        </p>
                      </div>
                    </div>
                    <div className="item">
                      <h2>My BIO</h2>
                      <div
                        className="profile-rich-text"
                        dangerouslySetInnerHTML={{
                          __html: sanitize(profile?.description),
                        }}
                      ></div>

                      <div>
                        <h3>Profile Images</h3>
                        {galleryLoading ? (
                          <LoadingSpinner />
                        ) : images.length > 0 ? (
                          <div className="profile-image-public-wrapper">
                            {images.map((image, index) => (
                              <button
                                key={image._id || `image-${index}`}
                                onClick={() => handleProfileImage(index)}
                                aria-pressed={index === activeProfileImageIndex}
                                aria-label={`View profile image ${index + 1} of ${images.length}`}
                                className={`gallery-thumbnail ${index === activeProfileImageIndex ? 'active' : ''}`}
                              >
                                <img src={image.avatar} alt="" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        ) : galleryError ? (
                          <p>Error loading images: {galleryError}</p>
                        ) : (
                          <p>No images available</p>
                        )}
                      </div>

                      <h2>Specialisation</h2>
                      <div
                        className="profile-rich-text"
                        dangerouslySetInnerHTML={{
                          __html: sanitize(profile?.specialisation),
                        }}
                      ></div>

                      <h2>Qualifications</h2>
                      <div
                        className="profile-rich-text"
                        dangerouslySetInnerHTML={{
                          __html: sanitize(profile?.qualifications),
                        }}
                      ></div>

                      <div className="verified">
                        <h3>Qualifications Verified</h3>

                        {qualificationVerification.isVerified ? (
                          <ImageTooltip
                            src={verifiedBadge}
                            alt="Verified by Body Vantage"
                            previewAlt="Verified by Body Vantage larger preview"
                            triggerLabel="CERTIFIED"
                            className="qualification-badge-tooltip"
                          />
                        ) : (
                          <i
                            className="fa fa-times qualification-status-icon is-not-verified"
                            role="img"
                            aria-label={qualificationVerification.label}
                          ></i>
                        )}
                        <span className="qualification-status-text">
                          {qualificationVerification.isVerified
                            ? 'CERTIFIED'
                            : qualificationVerification.label}
                        </span>
                      </div>
                    </div>
                    <div className="item">
                      <div>
                        {reviews.length > 0 ? (
                          <>
                            <h2>Reviews</h2>
                            {reviews.map((review) => (
                              <div key={review._id}>
                                <Review
                                  reviewer={
                                    review.showName ? review.name : 'ANONYMOUS'
                                  }
                                  review={review.comment}
                                  reviewedOn={moment(review.createdAt).fromNow()}
                                />
                              </div>
                            ))}
                            <Rating
                              value={profile?.rating}
                              text={`  from ${reviewCount} reviews`}
                            />
                            <LinkComp
                              route="reviewer-login"
                              routeName={`Write a review about ${profile?.name}`}
                            />
                          </>
                        ) : (
                          <>
                            <h2>Reviews</h2>
                            <p>
                              There is currently no reviews for {profile?.name}.
                            </p>
                            <p>
                              Be the first to review {profile?.name} by
                              <LinkComp
                                route="reviewer-login"
                                routeName={` clicking here`}
                              />
                            </p>
                          </>
                        )}
                      </div>
                      <div>
                        <h2>Contact Details</h2>
                        <p>Mobile: {profile?.telephoneNumber}</p>
                        <p>
                          Email:{' '}
                          <a
                            href={`mailto:${profile?.email}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {profile?.email}
                          </a>
                        </p>

                        {!profile?.faceBook && !profile?.instagram ? (
                          <p>Social media not set.</p>
                        ) : (
                          <>
                            <div className="social-media-wrapper">
                              {profile?.faceBook ? (
                                <FaceBookComponent
                                  faceBookUserName={profile?.faceBook}
                                />
                              ) : null}

                              {profile?.instagram ? (
                                <InstagramComponent
                                  instagramUserName={profile?.instagram}
                                />
                              ) : null}
                            </div>
                          </>
                        )}
                        {!profile?.websiteUrl ? (
                          <p>No website.</p>
                        ) : (
                          <p>
                            My website:{' '}
                            <a
                              href={`https://${profile?.websiteUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {profile?.websiteUrl}{' '}
                              <span aria-hidden="true">↗</span>
                              <span className="sr-only">
                                (opens in new tab)
                              </span>
                            </a>
                          </p>
                        )}
                      </div>
                      <div>
                        <h2>Location</h2>
                        <p>{profile?.location}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ProfileImagePicker>
            </>
          )}
          <LinkComp route="" routeName="Go back" />
        </>
      )}
    </div>
  );
};

export default FullProfileView;
