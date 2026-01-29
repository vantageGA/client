import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './AdminProfileView.scss';

import {
  profilesAdminAction,
  deleteProfileAction,
  profileVerifyQualificationAction,
  deleteReviewProfileAction,
} from '../../store/actions/profileActions';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import Button from '../../components/button/Button';
import SearchInput from '../../components/searchInput/SearchInput';

import moment from 'moment';

const AdminProfileView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [expandedReviewsId, setExpandedReviewsId] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 50;

  // Loading states for async actions
  const [loadingStates, setLoadingStates] = useState({
    deleteProfile: null,
    verifyQualification: null,
    deleteReview: null,
  });

  // Search state
  const [searching, setSearching] = useState(false);

  // Logged in user Details saved in local storage
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
    dispatch(profilesAdminAction(currentPage, profilesPerPage));
  }, [dispatch, navigate, userInfo, currentPage]);

  const profilesState = useSelector((state) => state.profilesAdmin);
  const { loading, error, success, profilesAdmin, page, pages, total } = profilesState;

  const toggleReviews = (profileId) => {
    setExpandedReviewsId(prev => prev === profileId ? null : profileId);
  };

  const toggleCard = (profileId) => {
    setExpandedCardId(prev => prev === profileId ? null : profileId);
  };

  const handleDeleteProfile = (id, name) => {
    // Dispatch user delete action
    if (window.confirm(`Are you sure you want to delete the profile for ${name}? This will permanently remove all reviews and profile data.`)) {
      setLoadingStates(prev => ({ ...prev, deleteProfile: id }));
      dispatch(deleteProfileAction(id)).finally(() => {
        setLoadingStates(prev => ({ ...prev, deleteProfile: null }));
      });
    }
  };

  const handleVerify = (id, name) => {
    // Dispatch verify qualification
    if (window.confirm(`Are you sure you want to verify the qualifications for ${name}?`)) {
      setLoadingStates(prev => ({ ...prev, verifyQualification: id }));
      dispatch(profileVerifyQualificationAction(id)).finally(() => {
        setLoadingStates(prev => ({ ...prev, verifyQualification: null }));
      });
    }
  };

  const handleDeleteReview = (profileId, reviewId, profileName) => {
    //Dispatch delete Review action
    if (window.confirm(`Are you sure you want to delete this review for ${profileName}?`)) {
      setLoadingStates(prev => ({ ...prev, deleteReview: `${profileId}-${reviewId}` }));
      dispatch(deleteReviewProfileAction(profileId, reviewId)).finally(() => {
        setLoadingStates(prev => ({ ...prev, deleteReview: null }));
      });
    }
  };

  const searchedProfiles = (profilesAdmin || []).filter((profile) => {
    if (keyword) {
      return profile.name.toLowerCase().includes(keyword.toLowerCase());
    } else {
      return profilesAdmin;
    }
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Search
  const [newProfilesAdmin, setNewProfilesAdmin] = useState(profilesAdmin);
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    setSearching(true);

    // Simulate search delay for better UX (remove in production)
    setTimeout(() => {
      setSearching(false);
    }, 500);
  };
  const handleSearchClear = () => {
    setKeyword('');
  };
  //SearchInput

  //sort
  const sortByRatingUp = (a, b) => {
    return parseInt(a.rating) - parseInt(b.rating);
  };
  const sortByRatingDown = (a, b) => {
    return parseInt(b.rating) - parseInt(a.rating);
  };

  const handleSort = (val) => {
    const newProfilesAdmin = [...profilesAdmin];
    switch (val) {
      case 'ratingUp':
        profilesAdmin.sort(sortByRatingUp);
        break;
      case 'ratingDown':
        profilesAdmin.sort(sortByRatingDown);
        break;
      default:
        return;
    }
    setNewProfilesAdmin(newProfilesAdmin);
  };

  useEffect(() => {
    setNewProfilesAdmin(newProfilesAdmin);
  }, [newProfilesAdmin]);

  //sort

  return (
    <>
      <fieldset className="fieldSet">
        <legend>Profiles</legend>
        {error ? <Message message={error} variant="error" ariaLive="assertive" /> : null}
        {success ? (
          <Message message="Profile has been successfully deleted" variant="success" autoClose={6000} ariaLive="polite" />
        ) : null}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="admin-profile-view-wrapper">
            <div className="admin-keyword-search">
              <SearchInput
                type="search"
                value={keyword}
                handleSearch={handleSearch}
                label="SEARCH A NAME"
                id="profile-search"
              />
              <Button

                text="Clear search"
                className="btn"
                title="Clear Search"
                onClick={handleSearchClear}
                disabled={!keyword}
              ></Button>
            </div>

            <p>
              {searching ? 'Searching...' :
               keyword ? `Found ${searchedProfiles.length} profile${searchedProfiles.length !== 1 ? 's' : ''} matching '${keyword}'` :
               `Showing ${searchedProfiles.length} profile${searchedProfiles.length !== 1 ? 's' : ''}`}
            </p>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead className="admin-table-header">
                  <tr>
                    <th>Profile</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>
                      <div className="sort-wrapper">
                        <button
                          onClick={() => handleSort('ratingUp')}
                          aria-label="Sort by rating ascending"
                          className="sort-button"
                          title="Sort ascending"
                        >
                          <i className="arrow fas fa-arrow-up" aria-hidden="true"></i>
                        </button>
                        <span>Rating</span>
                        <button
                          onClick={() => handleSort('ratingDown')}
                          aria-label="Sort by rating descending"
                          className="sort-button"
                          title="Sort descending"
                        >
                          <i className="arrow fas fa-arrow-down" aria-hidden="true"></i>
                        </button>
                      </div>
                    </th>
                    <th>Reviews</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {searchedProfiles.map((profile) => (
                    <tr key={profile._id} className="admin-table-row">
                      <td data-label="Profile">
                        <div className="profile-cell">
                          <img className="profile-image" src={profile.profileImage} alt={profile.name} />
                          <div className="profile-info">
                            <strong>{profile.name}</strong>
                            <span>{profile.email}</span>
                            <span>{profile.telephoneNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge ${profile.isQualificationsVerified ? 'verified' : 'unverified'}`}>
                          <i className={`fa ${profile.isQualificationsVerified ? 'fa-check' : 'fa-times'}`} aria-hidden="true"></i>
                          {profile.isQualificationsVerified ? ' Verified' : ' Unverified'}
                        </span>
                      </td>
                      <td data-label="Description">
                        <p className="desc-text">{profile.description}</p>
                        <p className="location-text">{profile.location}</p>
                      </td>
                      <td data-label="Rating">
                        <span className="rating-value">{profile.rating}</span>
                      </td>
                      <td data-label="Reviews">
                        <span>{profile.numReviews}</span>
                        <button
                          className="reviews-toggle"
                          onClick={() => toggleReviews(profile._id)}
                          aria-expanded={expandedReviewsId === profile._id}
                          aria-label={`${expandedReviewsId === profile._id ? 'Hide' : 'Show'} reviews for ${profile.name}`}
                        >
                          {expandedReviewsId === profile._id ? '▼ Hide' : '▶ Show'}
                        </button>
                      </td>
                      <td data-label="Created">{moment(profile.createdAt).fromNow()}</td>
                      <td data-label="Updated">{moment(profile.updatedAt).fromNow()}</td>
                      <td data-label="Actions">
                        <div className="actions-cell">
                          <Button
                            text={loadingStates.verifyQualification === profile._id ? 'Verifying...' : 'Verify'}
                            className="btn"
                            title="Verify Qualifications"
                            onClick={() => handleVerify(profile._id, profile.name)}
                            disabled={!profile._id || loadingStates.verifyQualification === profile._id}
                          />
                          <Button
                            text={loadingStates.deleteProfile === profile._id ? 'Deleting...' : 'Delete'}
                            className="btn btn-danger"
                            title="Delete Profile"
                            onClick={() => handleDeleteProfile(profile._id, profile.name)}
                            disabled={!profile._id || loadingStates.deleteProfile === profile._id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {expandedReviewsId && (() => {
              const expandedProfile = searchedProfiles.find(p => p._id === expandedReviewsId);
              if (!expandedProfile) return null;
              return (
                <div className="reviews-panel">
                  <h4>Reviews for {expandedProfile.name}</h4>
                  {expandedProfile.reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                  ) : (
                    expandedProfile.reviews.map(review => (
                      <div className="review-card" key={review._id}>
                        <div className="review-header">
                          <span className="review-author">{review.name}</span>
                          <span className="review-rating">{review.rating}/5</span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        <Button
                          text={loadingStates.deleteReview === `${expandedProfile._id}-${review._id}` ? 'Deleting...' : 'Delete Review'}
                          className="btn btn-danger"
                          title="Delete Review"
                          onClick={() => handleDeleteReview(expandedProfile._id, review._id, expandedProfile.name)}
                          disabled={loadingStates.deleteReview === `${expandedProfile._id}-${review._id}`}
                        />
                      </div>
                    ))
                  )}
                </div>
              );
            })()}

            <div className="mobile-cards">
              {searchedProfiles.map(profile => (
                <div className={`mobile-card ${expandedCardId === profile._id ? 'expanded' : ''}`} key={profile._id}>
                  <button className="card-summary" onClick={() => toggleCard(profile._id)} aria-expanded={expandedCardId === profile._id}>
                    <img className="profile-image" src={profile.profileImage} alt="" />
                    <div className="card-identity">
                      <strong>{profile.name}</strong>
                      <span>{profile.email}</span>
                    </div>
                    <div className="card-meta">
                      <span className={`status-badge ${profile.isQualificationsVerified ? 'verified' : 'unverified'}`}>
                        {profile.isQualificationsVerified ? 'Verified' : 'Unverified'}
                      </span>
                      <span className="rating-value">{profile.rating}</span>
                    </div>
                    <i className={`fa fa-chevron-${expandedCardId === profile._id ? 'up' : 'down'}`} aria-hidden="true" />
                  </button>

                  {expandedCardId === profile._id && (
                    <div className="card-details">
                      <div className="detail-row"><label>Phone</label><p>{profile.telephoneNumber}</p></div>
                      <div className="detail-row"><label>Description</label><p>{profile.description}</p></div>
                      <div className="detail-row"><label>Location</label><p>{profile.location}</p></div>
                      <div className="detail-row"><label>Created</label><p>{moment(profile.createdAt).fromNow()}</p></div>
                      <div className="detail-row"><label>Updated</label><p>{moment(profile.updatedAt).fromNow()}</p></div>

                      <button
                        className="reviews-toggle"
                        onClick={() => toggleReviews(profile._id)}
                        aria-expanded={expandedReviewsId === profile._id}
                      >
                        {expandedReviewsId === profile._id ? '▼' : '▶'} Reviews ({profile.numReviews})
                      </button>

                      {expandedReviewsId === profile._id && (
                        <div className="mobile-reviews">
                          {profile.reviews.length === 0 ? (
                            <p>No reviews yet.</p>
                          ) : (
                            profile.reviews.map(review => (
                              <div className="review-card" key={review._id}>
                                <div className="review-header">
                                  <span className="review-author">{review.name}</span>
                                  <span className="review-rating">{review.rating}/5</span>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <Button
                                  text={loadingStates.deleteReview === `${profile._id}-${review._id}` ? 'Deleting...' : 'Delete Review'}
                                  className="btn btn-danger"
                                  title="Delete Review"
                                  onClick={() => handleDeleteReview(profile._id, review._id, profile.name)}
                                  disabled={loadingStates.deleteReview === `${profile._id}-${review._id}`}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      <div className="card-actions">
                        <Button
                          text={loadingStates.verifyQualification === profile._id ? 'Verifying...' : 'Verify Qualifications'}
                          className="btn"
                          title="Verify Qualifications"
                          onClick={() => handleVerify(profile._id, profile.name)}
                          disabled={!profile._id || loadingStates.verifyQualification === profile._id}
                        />
                        <Button
                          text={loadingStates.deleteProfile === profile._id ? 'Deleting...' : 'Delete Profile'}
                          className="btn btn-danger"
                          title="Delete Profile"
                          onClick={() => handleDeleteProfile(profile._id, profile.name)}
                          disabled={!profile._id || loadingStates.deleteProfile === profile._id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }
                  }}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {pages} (Total: {total} profiles)
                </span>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pages}
                  aria-label="Next page"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </fieldset>
    </>
  );
};

export default AdminProfileView;
