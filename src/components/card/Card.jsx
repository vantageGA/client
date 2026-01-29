import React, { useEffect } from 'react';
import './Card.scss';
import { Link } from 'react-router-dom';
import Rating from '../rating/Rating';
import Button from '../button/Button';

import { profileClickCounterAction } from '../../store/actions/profileActions';
import { useDispatch, useSelector } from 'react-redux';

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
  const profilesState = useSelector((state) => state.profiles);
  const { profiles } = profilesState;

  // Server auto-increments click counter by 1, no need to pass count
  const handleProfileClickCounter = (_id) => {
    if (!_id) return;
    dispatch(profileClickCounterAction(_id));
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

          {specialisation}
          {description}
          {location}
          {isQualificationsVerified}
          {qualifications}
          {email}
          {telephoneNumber}
          {profileClickCounter}
          <Link className="link" to={`/fullProfile/${id}`}>
            <Button
              
              text="VIEW FULL PROFILE"
              className="btn link"
              disabled={false}
              onClick={() => handleProfileClickCounter(id)}
            ></Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
