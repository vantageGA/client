import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './AdminUserView.scss';

import {
  usersAction,
  deleteUserAction,
  userAddRemoveAdminAction,
} from '../../store/actions/userActions';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import Button from '../../components/button/Button';

import moment from 'moment';

const AdminView = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Loading states for async actions
  const [loadingStates, setLoadingStates] = useState({
    deleteUser: null,
    toggleAdmin: null,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logged in user Details saved in local storage
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
    dispatch(usersAction());
  }, [dispatch, navigate, userInfo]);

  const usersState = useSelector((state) => state.users);
  const { loading, error, userProfiles } = usersState;

  const toggleCard = (userId) => {
    setExpandedCardId(prev => prev === userId ? null : userId);
  };

  const handleDeleteUser = (id, name) => {
    // Dispatch user delete action
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      setLoadingStates(prev => ({ ...prev, deleteUser: id }));
      dispatch(deleteUserAction(id)).finally(() => {
        setLoadingStates(prev => ({ ...prev, deleteUser: null }));
        dispatch(usersAction());
      });
    }
  };

  const handleMakeAdmin = (id, val) => {
    const action = val ? 'grant admin privileges to' : 'remove admin privileges from';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      setLoadingStates(prev => ({ ...prev, toggleAdmin: id }));
      dispatch(userAddRemoveAdminAction({ id, val })).finally(() => {
        setLoadingStates(prev => ({ ...prev, toggleAdmin: null }));
      });
    }
  };

  const handleShowAdmin = () => {
    setShowAdmin(!showAdmin);
  };

  const filteredUsers = showAdmin
    ? (userProfiles || [])
    : (userProfiles || []).filter(u => !u.isAdmin);

  return (
    <>
      <fieldset className="fieldSet">
        <legend>Users</legend>
        {error ? <Message message={error} variant="error" ariaLive="assertive" /> : null}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="admin-user-view-wrapper">
            <div className="admin-toggle-bar">
              <Button
                text={showAdmin ? 'Hide Admin Users' : 'Show Admin Users'}
                className="btn"
                title={showAdmin ? 'Hide admin users' : 'Show admin users'}
                onClick={handleShowAdmin}
              />
              <span className="user-count">
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead className="admin-table-header">
                  <tr>
                    <th>User</th>
                    <th>Admin</th>
                    <th>Confirmed</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {filteredUsers.map((userProfile) => (
                    <tr key={userProfile._id} className="admin-table-row">
                      <td data-label="User">
                        <div className="profile-cell">
                          <img className="profile-image" src={userProfile.profileImage} alt={userProfile.name} />
                          <div className="profile-info">
                            <strong>{userProfile.name}</strong>
                            <span>{userProfile.email}</span>
                            <span className="user-id">{userProfile._id}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Admin">
                        <span className={`status-badge ${userProfile.isAdmin ? 'verified' : 'unverified'}`}>
                          <i className={`fa ${userProfile.isAdmin ? 'fa-check' : 'fa-times'}`} aria-hidden="true"></i>
                          {userProfile.isAdmin ? ' Admin' : ' User'}
                        </span>
                      </td>
                      <td data-label="Confirmed">
                        <span className={`status-badge ${userProfile.isConfirmed ? 'verified' : 'unverified'}`}>
                          <i className={`fa ${userProfile.isConfirmed ? 'fa-check' : 'fa-times'}`} aria-hidden="true"></i>
                          {userProfile.isConfirmed ? ' Confirmed' : ' Unconfirmed'}
                        </span>
                      </td>
                      <td data-label="Created">{moment(userProfile.createdAt).fromNow()}</td>
                      <td data-label="Updated">{moment(userProfile.updatedAt).fromNow()}</td>
                      <td data-label="Actions">
                        <div className="actions-cell">
                          <Button
                            text={userProfile.isAdmin
                              ? (loadingStates.toggleAdmin === userProfile._id ? 'Removing...' : 'Remove Admin')
                              : (loadingStates.toggleAdmin === userProfile._id ? 'Granting...' : 'Make Admin')}
                            className="btn"
                            title={userProfile.isAdmin ? 'Remove admin privileges' : 'Grant admin privileges'}
                            onClick={() => handleMakeAdmin(userProfile._id, !userProfile.isAdmin)}
                            disabled={!userProfile.isConfirmed || loadingStates.toggleAdmin === userProfile._id}
                          />
                          <Button
                            text={loadingStates.deleteUser === userProfile._id ? 'Deleting...' : 'Delete'}
                            className="btn btn-danger"
                            title={userProfile.isAdmin ? 'Cannot delete admin users' : 'Delete User'}
                            onClick={() => handleDeleteUser(userProfile._id, userProfile.name)}
                            disabled={!userProfile.isConfirmed || userProfile.isAdmin || loadingStates.deleteUser === userProfile._id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {filteredUsers.map(userProfile => (
                <div className={`mobile-card ${expandedCardId === userProfile._id ? 'expanded' : ''}`} key={userProfile._id}>
                  <button className="card-summary" onClick={() => toggleCard(userProfile._id)} aria-expanded={expandedCardId === userProfile._id}>
                    <img className="profile-image" src={userProfile.profileImage} alt="" />
                    <div className="card-identity">
                      <strong>{userProfile.name}</strong>
                      <span>{userProfile.email}</span>
                    </div>
                    <div className="card-meta">
                      <span className={`status-badge ${userProfile.isAdmin ? 'verified' : 'unverified'}`}>
                        {userProfile.isAdmin ? 'Admin' : 'User'}
                      </span>
                      <span className={`status-badge ${userProfile.isConfirmed ? 'verified' : 'unverified'}`}>
                        {userProfile.isConfirmed ? 'Confirmed' : 'Unconfirmed'}
                      </span>
                    </div>
                    <i className={`fa fa-chevron-${expandedCardId === userProfile._id ? 'up' : 'down'}`} aria-hidden="true" />
                  </button>

                  {expandedCardId === userProfile._id && (
                    <div className="card-details">
                      <div className="detail-row"><label>User ID</label><p>{userProfile._id}</p></div>
                      <div className="detail-row"><label>Created</label><p>{moment(userProfile.createdAt).fromNow()}</p></div>
                      <div className="detail-row"><label>Updated</label><p>{moment(userProfile.updatedAt).fromNow()}</p></div>
                      <div className="card-actions">
                        <Button
                          text={userProfile.isAdmin
                            ? (loadingStates.toggleAdmin === userProfile._id ? 'Removing...' : 'Remove Admin')
                            : (loadingStates.toggleAdmin === userProfile._id ? 'Granting...' : 'Make Admin')}
                          className="btn"
                          title={userProfile.isAdmin ? 'Remove admin privileges' : 'Grant admin privileges'}
                          onClick={() => handleMakeAdmin(userProfile._id, !userProfile.isAdmin)}
                          disabled={!userProfile.isConfirmed || loadingStates.toggleAdmin === userProfile._id}
                        />
                        <Button
                          text={loadingStates.deleteUser === userProfile._id ? 'Deleting...' : 'Delete User'}
                          className="btn btn-danger"
                          title={userProfile.isAdmin ? 'Cannot delete admin users' : 'Delete User'}
                          onClick={() => handleDeleteUser(userProfile._id, userProfile.name)}
                          disabled={!userProfile.isConfirmed || userProfile.isAdmin || loadingStates.deleteUser === userProfile._id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>
    </>
  );
};

export default AdminView;
