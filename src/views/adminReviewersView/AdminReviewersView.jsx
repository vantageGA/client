import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './AdminReviewersView.scss';

import {
  userAdminReviewersDetailsAction,
  deleteReviewerAdminAction,
} from '../../store/actions/userReviewActions';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import Button from '../../components/button/Button';

import moment from 'moment';

const AdminReviewersView = () => {
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Loading states for async actions
  const [loadingStates, setLoadingStates] = useState({
    deleteReviewer: null,
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
    dispatch(userAdminReviewersDetailsAction());
  }, [dispatch, navigate, userInfo]);

  const userAdminReviewersDetails = useSelector(
    (state) => state.userAdminReviewersDetails,
  );
  const { loading, error, reviewers } = userAdminReviewersDetails;

  const toggleCard = (reviewerId) => {
    setExpandedCardId(prev => prev === reviewerId ? null : reviewerId);
  };

  const handleDeleteUser = (id, name) => {
    // Dispatch user delete action
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      setLoadingStates(prev => ({ ...prev, deleteReviewer: id }));
      dispatch(deleteReviewerAdminAction(id)).finally(() => {
        setLoadingStates(prev => ({ ...prev, deleteReviewer: null }));
        dispatch(userAdminReviewersDetailsAction());
      });
    }
  };

  return (
    <>
      <fieldset className="fieldSet">
        <legend>Reviewers Details</legend>
        {error ? <Message message={error} /> : null}

        {loading ? (
          <LoadingSpinner />
        ) : reviewers.length === 0 ? (
          <p>No reviewers found.</p>
        ) : (
          <div className="admin-reviewers-view-wrapper">
            <p className="reviewer-count">
              {reviewers.length} reviewer{reviewers.length !== 1 ? 's' : ''}
            </p>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead className="admin-table-header">
                  <tr>
                    <th>Reviewer</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {reviewers.map((reviewer) => (
                    <tr key={reviewer._id} className="admin-table-row">
                      <td data-label="Reviewer">
                        <strong>{reviewer.name}</strong>
                      </td>
                      <td data-label="Email">{reviewer.email}</td>
                      <td data-label="Created">{moment(reviewer.createdAt).fromNow()}</td>
                      <td data-label="Actions">
                        <div className="actions-cell">
                          <Button
                            text={loadingStates.deleteReviewer === reviewer._id ? 'Deleting...' : 'Delete'}
                            className="btn btn-danger"
                            title="Delete Reviewer"
                            onClick={() => handleDeleteUser(reviewer._id, reviewer.name)}
                            disabled={loadingStates.deleteReviewer === reviewer._id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {reviewers.map(reviewer => (
                <div className={`mobile-card ${expandedCardId === reviewer._id ? 'expanded' : ''}`} key={reviewer._id}>
                  <button className="card-summary" onClick={() => toggleCard(reviewer._id)} aria-expanded={expandedCardId === reviewer._id}>
                    <div className="card-identity">
                      <strong>{reviewer.name}</strong>
                      <span>{reviewer.email}</span>
                    </div>
                    <i className={`fa fa-chevron-${expandedCardId === reviewer._id ? 'up' : 'down'}`} aria-hidden="true" />
                  </button>

                  {expandedCardId === reviewer._id && (
                    <div className="card-details">
                      <div className="detail-row"><label>Email</label><p>{reviewer.email}</p></div>
                      <div className="detail-row"><label>Created</label><p>{moment(reviewer.createdAt).fromNow()}</p></div>
                      <div className="card-actions">
                        <Button
                          text={loadingStates.deleteReviewer === reviewer._id ? 'Deleting...' : 'Delete Reviewer'}
                          className="btn btn-danger"
                          title="Delete Reviewer"
                          onClick={() => handleDeleteUser(reviewer._id, reviewer.name)}
                          disabled={loadingStates.deleteReviewer === reviewer._id}
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

export default AdminReviewersView;
