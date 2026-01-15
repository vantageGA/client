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
import LinkComp from '../../components/linkComp/LinkComp';
import Rating from '../../components/rating/Rating';
import Review from '../../components/review/Review';

import moment from 'moment';
import DOMPurify from 'dompurify';

import FaceBookComponent from '../../components/socialMedia/faceBook/FaceBookComponent';
import InstagramComponent from '../../components/socialMedia/Instagram/InstagramComponent';

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

const FullProfileView = () => {
  const [profileImageIndex, setProfileImageIndex] = useState(0);
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
    return () => {
      console.log('Full Profile cleanup');
    };
  }, [dispatch, profile?.user]);

  const profileImagesPublic = useSelector((state) => state.profileImagesPublic);
  const {
    loading: profileImageLoading,
    profileImages,
    error: profileImageError,
    pages: imagePagesCount
  } = profileImagesPublic;

  const handleProfileImage = (index) => {
    setProfileImageIndex(index);
  };

  // Note: For now showing first page of images only
  // In a future enhancement, could add pagination controls for images

  // Filter empty specialisations
  const specialisations = [
    profile?.specialisationOne,
    profile?.specialisationTwo,
    profile?.specialisationThree,
    profile?.specialisationFour
  ].filter(s => s && s.trim());

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
                <section className="profile-specialisation-header" aria-label="Professional specialisations">
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
              <div className="full-profile-wrapper">
                <div className="item first-column">
                  <div>
                    <h1 className="full-profile-name">{profile?.name}</h1>
                    <Rating
                      value={profile?.rating}
                      text={`  from ${profile?.numReviews} reviews`}
                    />
                  </div>

                  <div
                    className="bg-image"
                    style={{
                      backgroundImage:
                        profileImages.length > 0
                          ? `url(${profileImages[profileImageIndex]?.avatar})`
                          : null,
                    }}
                  ></div>

                  <div className="full-profile-time">
                    <p>
                      {profile?.name} has had {profile?.profileClickCounter}{' '}
                      views.
                    </p>
                  </div>
                </div>
                <div className="item">
                  <h2>My BIO</h2>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: sanitize(profile?.description),
                    }}
                  ></p>

                  <div>
                    <h3>Profile Images</h3>
                    {profileImages && profileImages.length > 0 ? (
                      <div className="profile-image-public-wrapper">
                        {profileImages.map((image, index) =>
                          profileImageLoading ? (
                            <LoadingSpinner key={`loading-${index}`} />
                          ) : (
                            <button
                              key={image._id || `image-${index}`}
                              onClick={() => handleProfileImage(index)}
                              aria-pressed={index === profileImageIndex}
                              aria-label={`View profile image ${index + 1} of ${profileImages.length}`}
                              className={`gallery-thumbnail ${index === profileImageIndex ? 'active' : ''}`}
                            >
                              <img src={image.avatar} alt="" aria-hidden="true" />
                            </button>
                          ),
                        )}
                      </div>
                    ) : profileImageError ? (
                      <p>Error loading images: {profileImageError}</p>
                    ) : (
                      <p>No images available</p>
                    )}
                  </div>

                  <h2>Specialisation</h2>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: sanitize(profile?.specialisation),
                    }}
                  ></p>

                  <h2>Qualifications</h2>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: sanitize(profile?.qualifications),
                    }}
                  ></p>

                  <div className="verified">
                    <h3>Qualifications Verified</h3>

                    {profile?.isQualificationsVerified === true ? (
                      <i
                        className="fa fa-check"
                        role="img"
                        aria-label="Verified"
                        style={{
                          fontSize: 20 + 'px',
                          color: 'rgba(92, 184, 92, 1)',
                          marginLeft: 12 + 'px',
                        }}
                      ></i>
                    ) : (
                      <i
                        className="fa fa-times"
                        role="img"
                        aria-label="Not verified"
                        style={{
                          fontSize: 20 + 'px',
                          color: 'crimson',
                          marginLeft: 12 + 'px',
                        }}
                      ></i>
                    )}
                  </div>
                </div>
                <div className="item">
                  <div>
                    {profile?.reviews.length > 0 ? (
                      <>
                        <h2>Reviews</h2>
                        {profile?.reviews.map((review) => (
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
                          text={`  from ${profile?.numReviews} reviews`}
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
                          {profile?.websiteUrl} <span aria-hidden="true">↗</span>
                          <span className="sr-only">(opens in new tab)</span>
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
            </>
          )}
          <LinkComp route="" routeName="GO BACK" />
        </>
      )}
    </div>
  );
};

export default FullProfileView;
