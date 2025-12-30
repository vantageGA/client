import React from 'react';
import './LoginOut.scss';
import LinkComp from '../linkComp/LinkComp';

const LoginOut = ({
  description,
  route,
  routeDescription,
  onClick,
  definition,
}) => {
  return (
    <div className="login-out-wrapper">
      <button onClick={onClick} className="login-out-definition" type="button">
        {definition}
      </button>
      <span className="login-out-text">{description}</span>
      <LinkComp route={route} routeName={routeDescription} />
    </div>
  );
};

export default LoginOut;
