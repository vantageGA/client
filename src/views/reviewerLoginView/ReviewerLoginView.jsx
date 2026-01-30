import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ReviewerLoginView.scss';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import Rating from '../../components/rating/Rating';
import Review from '../../components/review/Review';
import { isValidEmail } from '../../utils/validation';
import FormSectionAccordion from '../../components/formSectionAccordion/FormSectionAccordion';

import {
  userReviewLoginAction,
  createUserReviewAction,
  userReviewersDetailsAction,
} from '../../store/actions/userReviewActions';

import moment from 'moment';
import DOMPurify from 'dompurify';

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

const ReviewerLoginView = () => {
  const dispatch = useDispatch();
  const passwordRegEx = /([^\s])/;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rating, setRating] = useState(5);
  let [showName, setShowName] = useState(false);
  const [comment, setComment] = useState('');
  const [showWarning, setShowWaring] = useState(true);
  const [showGuidelinesAccepted, setShowGuidelinesAccepted] = useState(false);
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [noUserProfile, setNoUserProfile] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);
  const [openSection, setOpenSection] = useState('');

  // Info stored in local storage
  const userReviewLogin = useSelector((state) => state.userReviewLogin);
  const { loading, error, userReviewInfo } = userReviewLogin;

  const createReview = useSelector((state) => state.createReview);
  const { success, error: reviewError } = createReview;

  const profileState = useSelector((state) => state.profileById);
  const { profile } = profileState;

  //This is the profile id of the person that you are going to review
  const userId = useSelector((state) => state.userReviewId);
  const { userProfileId } = userId;

  const userReviewersDetails = useSelector(
    (state) => state.userReviewersDetails,
  );
  const { reviewer } = userReviewersDetails;

  const handleAcceptConditions = () => {
    if (userReviewInfo) {
      dispatch(userReviewersDetailsAction(userReviewInfo._id));
    }
    setShowWaring(false);
    setAcceptConditions(true);
    setShowGuidelinesAccepted(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (profile) {
      dispatch(userReviewLoginAction(email, password, profile?.user));
    } else {
      setNoUserProfile(
        'You have not selected a user to review or you email address has not been confirmed',
      );
    }
  };

  React.useEffect(() => {
    if (error && error.toLowerCase().includes('confirm')) {
      setShowEmailVerificationMessage(true);
    } else if (error && error.toLowerCase().includes('verify')) {
      setShowEmailVerificationMessage(true);
    } else {
      setShowEmailVerificationMessage(false);
    }
  }, [error]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (reviewer?.isConfirmed !== true) {
      alert('Please confirm your email address before submitting a review.');
      return;
    }

    // Ensure acceptConditions is boolean true, not string or truthy value
    if (acceptConditions !== true) {
      alert('You must accept the review conditions before submitting.');
      return;
    }

    // Dispatch reviewer comment of trainer
    dispatch(
      createUserReviewAction(userReviewInfo?._id, {
        rating,
        comment,
        showName,
        userProfileId,
        acceptConditions: true, // Always send boolean true
      }),
    );
    setShowGuidelinesAccepted(false);
    setRating(5);
    setComment('');
  };

  return (
    <div className="user-review-login-wrapper">
      {error ? <Message message={error} /> : null}
      {showEmailVerificationMessage ? (
        <Message
          message="Please check your email and click the verification link to activate your reviewer account before logging in."
          variant="warning"
        />
      ) : null}
      {noUserProfile ? <Message message={noUserProfile} /> : null}

      {!userReviewInfo ? (
        loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="reviewer-login-form">
              <fieldset className="fieldSet">
                <legend>
                  Reviewer <span>Login</span>
                </legend>
                <form onSubmit={handleSubmit} noValidate>
                  <InputField
                    id="reviewer-email"
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    required
                    hint="Example: user@domain.com"
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={
                      touched.email && !isValidEmail(email) && email.length > 0
                        ? 'invalid'
                        : email.length > 0
                        ? 'entered'
                        : ''
                    }
                    error={
                      touched.email && !isValidEmail(email) && email.length !== 0
                        ? `Invalid email address.`
                        : null
                    }
                    aria-invalid={touched.email && !isValidEmail(email)}
                  />
                  <InputField
                    id="reviewer-password"
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    required
                    hint="Password must not be empty"
                    className={
                      touched.password && !passwordRegEx.test(password) && password.length > 0
                        ? 'invalid'
                        : password.length > 0
                        ? 'entered'
                        : ''
                    }
                    error={
                      touched.password && !passwordRegEx.test(password) && password.length !== 0
                        ? `Password can not be empty`
                        : null
                    }
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    aria-invalid={touched.password && !passwordRegEx.test(password)}
                  />

                  <Button
                    
                    text="Login"
                    className="btn"
                    disabled={
                      !passwordRegEx.test(password) || !isValidEmail(email)
                    }
                  ></Button>
                </form>
              </fieldset>
              <div className="reviewer-login-links">
                <LinkComp
                  route="reviewer-register"
                  routeName="Register here to review"
                />
                <LinkComp
                  route="reviewer-forgot-password"
                  routeName="Forgot Password"
                />
              </div>
            </div>
          </>
        )
      ) : (
        <>
          <div className="reviewer-wrapper">
            {reviewError ? <Message message={reviewError} /> : null}
            {reviewer?.isConfirmed === false ? (
              <Message message="PLEASE CONFIRM YOUR EMAIL ADDRESS" variant="warning" />
            ) : null}
            {success ? (
              <Message message="Your review has been sent." variant="success" autoClose={5000} />
            ) : null}
            {showGuidelinesAccepted ? (
              <Message message="Review guidelines accepted." variant="success" autoClose={3000} />
            ) : null}
            <fieldset className="fieldSet">
              <legend>Profile {profile?.name ? `- ${profile.name}` : ''}</legend>
              <FormSectionAccordion
                title={`Click to view ${profile?.name || 'trainer'} profile`}
                isOpen={openSection === 'profile'}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === 'profile' ? '' : 'profile',
                  )
                }
              >
              <div className="profile-specialisation-header" aria-label="Professional specialisations">
                <h2 className="sr-only">Specialisations</h2>
                <div className="specialisation-tags-container">
                  {[
                    profile?.specialisationOne,
                    profile?.specialisationTwo,
                    profile?.specialisationThree,
                    profile?.specialisationFour,
                  ]
                    .filter((spec) => spec && spec.trim())
                    .map((spec, index) => (
                      <span key={index} className="specialisation-tag">
                        {spec}
                      </span>
                    ))}
                </div>
              </div>

              <div className="full-profile-wrapper">
                <div className="item first-column">
                  <div>
                    <div className="full-profile-name">{profile?.name}</div>
                    <Rating
                      value={profile?.rating}
                      text={`  from ${profile?.numReviews} reviews`}
                    />
                  </div>

                  <div
                    className="bg-image"
                    style={{
                      backgroundImage: profile?.profileImage
                        ? `url(${profile?.profileImage})`
                        : null,
                    }}
                  ></div>
                </div>

                <div className="item">
                  <h2>My BIO</h2>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: sanitize(profile?.description),
                    }}
                  ></p>

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
                </div>

                <div className="item">
                  {profile?.reviews.length > 0 ? (
                    <>
                      <h2>Reviews</h2>
                      {profile.reviews.map((review) => (
                        <div key={review._id}>
                          <Review
                            reviewer={review.showName ? review.name : 'ANONYMOUS'}
                            review={review.comment}
                            reviewedOn={moment(review.createdAt).fromNow()}
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <h2>Reviews</h2>
                      <p>There is currently no reviews for {profile?.name}.</p>
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
              </div>
              </FormSectionAccordion>
            </fieldset>

            <fieldset className="fieldSet">
              <legend>Review {profile?.name || 'Trainer'}</legend>

              {showWarning ? (
                <>
                  <h1>Reviewer Conditions</h1>
                  <h3>When to write a review</h3>
                  <p>
                    You can write a review if you’ve had a recent, genuine
                    experience.
                  </p>
                  <p>
                    Reviews are your chance to share your experiences with
                    others and give feedback to companies. Size doesn’t matter
                    here, we think all experiences big and small are worth
                    reviewing — whether it’s a phone call, an online enquiry.
                  </p>
                  <p>
                    Just keep it fresh by writing about your experience that
                    happened in the past 12 months.
                  </p>
                  <h3>Dont write a fake or biased review</h3>
                  <p>
                    Don’t make up an experience or write a review for someone
                    else — leave it to them to write their own review. And if
                    you’re closely associated with, work for, or are in
                    competition with a particular company, you shouldn’t review
                    it.
                  </p>
                  <h3>Keep proof of your experience</h3>
                  <p>
                    Hold onto documentation that shows you’ve had an experience
                    with the company (for example, a receipt, order
                    confirmation, screenshot of your chat with online customer
                    service) because you might be asked to verify your
                    experience.
                  </p>
                  <h3>Play nice</h3>
                  <p>
                    We expect you to be a respectful contributor to our
                    platform. So play nice, don’t be a jerk. Don’t post anything
                    harmful, hateful, discriminatory, defamatory or obscene. And
                    don’t lie, bully, blackmail, make threats or do anything
                    illegal.
                  </p>
                  <h3>The final say</h3>
                  <p>
                    These guidelines are just that: guiding principles. Please
                    understand that we have the final say with regard to the
                    interpretation and application of these guidelines, and we
                    can update them at any time.
                  </p>

                  <Button
                    
                    text="Accept Review Guidelines"
                    className="btn"
                    onClick={handleAcceptConditions}
                    disabled={false}
                  ></Button>
                </>
              ) : (
                <>
                  <form onSubmit={handleReviewSubmit}>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={showName}
                          onChange={() => setShowName(!showName)}
                        />
                        <span className="userReviewInfo">
                          {userReviewInfo?.name}
                        </span>
                        , by checking this box you are agreeing to display your
                        name in the review.
                      </label>
                    </div>
                    <div className="select-wrapper">
                      <label htmlFor="rating-select">Rating</label>
                      <select
                        id="rating-select"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        aria-describedby="rating-hint"
                      >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                      <span id="rating-hint" className="field-hint">
                        Select the star rating for your review
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="review-comment">Review</label>
                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        name="comment"
                        required
                        className={
                          comment?.length < 10 ? 'invalid' : 'entered'
                        }
                        aria-invalid={comment?.length < 10 && comment.length > 0}
                        aria-describedby="comment-hint comment-error"
                        aria-required="true"
                      />
                      <span id="comment-hint" className="field-hint">
                        Minimum 10 characters required
                      </span>
                      {comment?.length < 10 && comment.length > 0 && (
                        <p id="comment-error" className="validation-error" role="alert">
                          Comment must contain at least 10 characters
                        </p>
                      )}
                    </div>
                    <Button
                      
                      text="Submit"
                      className="btn"
                      disabled={
                        !rating ||
                        comment.length < 10 ||
                        reviewer?.isConfirmed !== true
                      }
                    ></Button>
                  </form>
                </>
              )}
            </fieldset>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewerLoginView;
