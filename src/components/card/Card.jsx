import React from 'react';
import './Card.scss';
import { useNavigate } from 'react-router-dom';
import Rating from '../rating/Rating';
import Button from '../button/Button';

import { profileClickCounterAction } from '../../store/actions/profileActions';
import { useDispatch } from 'react-redux';

const isQualificationVerifiedForCard = (
  qualificationVerificationStatus,
  isQualificationsVerified,
) => {
  const normalizedStatus = (qualificationVerificationStatus || '')
    .toString()
    .trim()
    .toLowerCase();

  if (normalizedStatus) {
    return normalizedStatus === 'approved';
  }

  return isQualificationsVerified === true;
};

const Card = ({
  id,
  name,
  src,
  alt,
  description,
  location,
  email,
  telephoneNumber,
  specialisation,
  qualifications,
  qualificationVerificationStatus,
  isQualificationsVerified,
  rating,
  reviews,
  specialisationOne,
  specialisationTwo,
  specialisationThree,
  specialisationFour,
  profileClickCounter,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasVerifiedQualification = isQualificationVerifiedForCard(
    qualificationVerificationStatus,
    isQualificationsVerified,
  );

  // Server auto-increments click counter by 1, no need to pass count
  const handleProfileClickCounter = () => {
    if (!id) return;

    dispatch(profileClickCounterAction(id));
    navigate(`/fullProfile/${id}`);
  };

  return (
    <div className="card-inner-wrapper">
      <div className="item">
        {specialisationOne && <div className="specialisation">{specialisationOne}</div>}
        {specialisationTwo && <div className="specialisation">{specialisationTwo}</div>}
        {specialisationThree && <div className="specialisation">{specialisationThree}</div>}
        {specialisationFour && <div className="specialisation">{specialisationFour}</div>}
      </div>

      <div className="item">
        <img
          className="card-profile-image"
          src={src}
          alt={alt}
          loading="lazy"
        />
        <div>
          <div className="card-name">{name}</div>
          <Rating value={rating} text={`  from ${reviews} reviews`} />
          {hasVerifiedQualification ? (
            <div className="qualification-verified-badge">
              <i
                className="fa fa-check-circle qualification-verified-icon"
                aria-hidden="true"
              ></i>
              <span>Verified Professional</span>
            </div>
          ) : null}

          {specialisation}
          {description}
          {location}
          {qualifications}
          {email}
          {telephoneNumber}
          {profileClickCounter}
          <div className="link">
            <Button
              type="button"
              text="VIEW FULL PROFILE"
              disabled={false}
              onClick={handleProfileClickCounter}
            ></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
