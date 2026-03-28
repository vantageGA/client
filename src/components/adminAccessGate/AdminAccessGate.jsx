import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import Message from '../message/Message';

export const ADMIN_ACCESS_DENIED_MESSAGE = 'Not authorised as an ADMIN';

const AdminAccessGate = ({ children }) => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const isAuthenticated = Boolean(userInfo?.token);
  const hasAdminAccess = userInfo?.isAdmin === true;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!hasAdminAccess) {
    return (
      <Message
        message={ADMIN_ACCESS_DENIED_MESSAGE}
        variant="error"
        ariaLive="assertive"
      />
    );
  }

  return <>{children}</>;
};

AdminAccessGate.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminAccessGate;
