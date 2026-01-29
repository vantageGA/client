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
  const [showReviewsId, setShowReviewsId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 50;

  let [showReviews, setShowReviews] = useState(false);
  
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
                    <th className="admin-table-cell">NAME</th>
                    <th className="admin-table-cell">VERIFIED</th>
                    <th className="admin-table-cell admin-table-cell--wide">DESCRIPTION</th>
                    <th className="admin-table-cell">
                      <div className="sort-wrapper">
                        <button
                          onClick={() => handleSort('ratingUp')}
                          aria-label="Sort profiles by rating ascending"
                          className="sort-button"
                          title="Sort ascending"
                        >
                          <i className="arrow fas fa-arrow-up" aria-hidden="true"></i>
                        </button>
                        <span>RATING</span>
                        <button
                          onClick={() => handleSort('ratingDown')}
                          aria-label="Sort profiles by rating descending"
                          className="sort-button"
                          title="Sort descending"
                        >
                          <i className="arrow fas fa-arrow-down" aria-hidden="true"></i>
                        </button>
                      </div>
                    </th>
                    <th className="admin-table-cell">REVIEWS</th>
                    <th className="admin-table-cell">CREATED</th>
                    <th className="admin-table-cell">UPDATED</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {searchedProfiles.map((profile, index) => (
                    <tr key={profile._id} className="admin-table-row">
                      <td className="admin-table-cell">
                        <Button
                          text={loadingStates.deleteProfile === profile._id ? 'Deleting...' : 'Delete Profile'}
                          className="btn"
                          title="Delete Profile"
                          onClick={() => handleDeleteProfile(profile._id, profile.name)}
                          disabled={!profile._id || loadingStates.deleteProfile === profile._id}
                        ></Button>
                        <p>{profile.name}</p>
                        <img
                          className="image"
                          src={profile.profileImage}
                          alt={profile.name}
                        />
                        <p>{profile.email}</p>
                        <p>{profile.telephoneNumber}</p>
                      </td>

                      <td className="admin-table-cell">
                        <>
                          <Button
                            text={loadingStates.verifyQualification === profile._id ? 'Verifying...' : 'Verify Qualifications'}
                            className="btn"
                            title="Verify Qualifications"
                            onClick={() => handleVerify(profile._id, profile.name)}
                            disabled={!profile._id || loadingStates.verifyQualification === profile._id}
                          ></Button>

                          {profile.isQualificationsVerified === true ? (
                            <span className="status-badge verified">
                              <i className="fa fa-check" aria-hidden="true"></i> Verified
                            </span>
                          ) : (
                            <span className="status-badge unverified">
                              <i className="fa fa-times" aria-hidden="true"></i> Unverified
                            </span>
                          )}
                        </>
                      </td>

                      <td className="admin-table-cell admin-table-cell--wide">
                        <h3>Description</h3>
                        {profile.description}
                        <h3>Location</h3>
                        {profile.location}
                      </td>

                      <td className="admin-table-cell">{profile.rating}</td>

                      <td className="admin-table-cell">
                        {profile.numReviews}

                        <Button
                          text={
                            showReviewsId === profile._id && showReviews
                              ? '▼ Hide Reviews'
                              : '▶ Show Reviews'
                          }
                          className="btn"
                          title={showReviewsId === profile._id && showReviews ? 'Hide reviews' : 'Show reviews'}
                          onClick={() =>
                            setShowReviewsId(
                              profile._id,
                              setShowReviews((showReviews = !showReviews)),
                            )
                          }
                          disabled={
                            showReviewsId !== profile._id && showReviews
                              ? true
                              : false
                          }
                          aria-expanded={showReviewsId === profile._id && showReviews}
                          aria-label={`${showReviewsId === profile._id && showReviews ? 'Hide' : 'Show'} reviews for ${profile.name}`}
                        ></Button>
                        {showReviewsId === profile._id && showReviews
                          ? profile.reviews.map((review) => (
                              <div key={review._id}>
                                <div className="review-item">
                                  <p>By: {review.name}</p>
                                  <p>Review: {review.comment}</p>
                                  <p>Rating: {review.rating}</p>
                                  <Button
                                    text={loadingStates.deleteReview === `${profile._id}-${review._id}` ? 'Deleting...' : 'Delete Review'}
                                    className="btn"
                                    title="Delete Review"
                                    onClick={() =>
                                      handleDeleteReview(profile._id, review._id, profile.name)
                                    }
                                    disabled={loadingStates.deleteReview === `${profile._id}-${review._id}`}
                                  ></Button>
                                </div>
                              </div>
                            ))
                          : null}
                      </td>

                      <td className="admin-table-cell">
                        {moment(profile.createdAt).fromNow()}
                      </td>

                      <td className="admin-table-cell">
                        {moment(profile.updatedAt).fromNow()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="pagination-wrapper">
                <button
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
