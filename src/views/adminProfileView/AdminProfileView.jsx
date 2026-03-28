import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './AdminProfileView.scss';

import {
  profilesAdminAction,
  deleteProfileAction,
  deleteReviewProfileAction,
} from '../../store/actions/profileActions';
import {
  qualificationDocumentsAdminAction,
  reviewQualificationDocumentAction,
} from '../../store/actions/qualificationDocumentActions';
import {
  QUALIFICATION_DOCUMENT_ADMIN_LIST_RESET,
  QUALIFICATION_DOCUMENT_REVIEW_RESET,
} from '../../store/constants/qualificationDocumentConstants';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import AdminAccessGate from '../../components/adminAccessGate/AdminAccessGate';
import Message from '../../components/message/Message';
import Button from '../../components/button/Button';
import SearchInput from '../../components/searchInput/SearchInput';

import moment from 'moment';

const QUALIFICATION_DOCUMENTS_PER_PAGE = 10;
const REJECTION_REASON_MIN_LENGTH = 10;
const REJECTION_REASON_MAX_LENGTH = 500;
const QUALIFICATION_DOCUMENT_STATUS_FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

const getQualificationStatusLabel = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Not Submitted';
  }
};

const getQualificationStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return 'fa-check';
    case 'pending':
      return 'fa-clock-o';
    case 'rejected':
      return 'fa-exclamation-circle';
    default:
      return 'fa-upload';
  }
};

const getProfileQualificationStatus = (profile) =>
  profile?.qualificationVerificationStatus ||
  (profile?.isQualificationsVerified ? 'approved' : 'none');

const getQualificationDocumentAdminFilters = (statusFilter) => ({
  isActive: true,
  ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
});

const AdminProfileViewContent = () => {
  const dispatch = useDispatch();

  const [keyword, setKeyword] = useState('');
  const [sortDirection, setSortDirection] = useState('none');
  const [expandedReviewsId, setExpandedReviewsId] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDocumentPage, setCurrentDocumentPage] = useState(1);
  const [documentStatusFilter, setDocumentStatusFilter] = useState('pending');
  const [rejectEditorDocumentId, setRejectEditorDocumentId] = useState(null);
  const [rejectValidationError, setRejectValidationError] = useState('');
  const [rejectDraftByDocument, setRejectDraftByDocument] = useState({});
  const [downloadError, setDownloadError] = useState('');
  const [downloadErrorVersion, setDownloadErrorVersion] = useState(0);
  const profilesPerPage = 50;

  // Loading states for async actions
  const [loadingStates, setLoadingStates] = useState({
    deleteProfile: null,
    deleteReview: null,
    reviewDocument: null,
    downloadDocument: null,
  });

  useEffect(() => {
    dispatch(profilesAdminAction(currentPage, profilesPerPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(
      qualificationDocumentsAdminAction(
        currentDocumentPage,
        QUALIFICATION_DOCUMENTS_PER_PAGE,
        getQualificationDocumentAdminFilters(documentStatusFilter),
      ),
    );
  }, [dispatch, currentDocumentPage, documentStatusFilter]);

  useEffect(
    () => () => {
      dispatch({ type: QUALIFICATION_DOCUMENT_REVIEW_RESET });
      dispatch({ type: QUALIFICATION_DOCUMENT_ADMIN_LIST_RESET });
    },
    [dispatch],
  );

  const profilesState = useSelector((state) => state.profilesAdmin);
  const { loading, error, success, profilesAdmin, page, pages, total } = profilesState;
  const qualificationDocumentsAdminState = useSelector(
    (state) => state.qualificationDocumentsAdmin,
  );
  const {
    loading: qualificationDocumentsLoading,
    error: qualificationDocumentsError,
    documents: qualificationDocumentsAdmin = [],
    page: qualificationDocumentsPage = 1,
    pages: qualificationDocumentsPages = 1,
    total: qualificationDocumentsTotal = 0,
  } = qualificationDocumentsAdminState;
  const qualificationDocumentReviewState = useSelector(
    (state) => state.qualificationDocumentReview,
  );
  const {
    success: qualificationDocumentReviewSuccess,
    error: qualificationDocumentReviewError,
    message: qualificationDocumentReviewMessage,
  } = qualificationDocumentReviewState;
  const { userInfo } = useSelector((state) => state.userLogin);

  const searchedProfiles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const filteredProfiles = Array.isArray(profilesAdmin)
      ? [...profilesAdmin].filter((profile) => {
          if (!normalizedKeyword) {
            return true;
          }

          return profile.name?.toLowerCase().includes(normalizedKeyword);
        })
      : [];

    if (sortDirection === 'ratingUp') {
      return filteredProfiles.sort(
        (firstProfile, secondProfile) =>
          Number(firstProfile.rating ?? 0) - Number(secondProfile.rating ?? 0),
      );
    }

    if (sortDirection === 'ratingDown') {
      return filteredProfiles.sort(
        (firstProfile, secondProfile) =>
          Number(secondProfile.rating ?? 0) - Number(firstProfile.rating ?? 0),
      );
    }

    return filteredProfiles;
  }, [keyword, profilesAdmin, sortDirection]);

  useEffect(() => {
    if (!qualificationDocumentReviewSuccess && !qualificationDocumentReviewError) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch({ type: QUALIFICATION_DOCUMENT_REVIEW_RESET });
    }, 6000);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    qualificationDocumentReviewSuccess,
    qualificationDocumentReviewError,
  ]);

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

  const handleDeleteReview = (profileId, reviewId, profileName) => {
    //Dispatch delete Review action
    if (window.confirm(`Are you sure you want to delete this review for ${profileName}?`)) {
      setLoadingStates(prev => ({ ...prev, deleteReview: `${profileId}-${reviewId}` }));
      dispatch(deleteReviewProfileAction(profileId, reviewId)).finally(() => {
        setLoadingStates(prev => ({ ...prev, deleteReview: null }));
      });
    }
  };

  const handleQualificationDocumentReview = (
    document,
    status,
    rejectionReason = '',
  ) => {
    if (!document?._id) {
      return;
    }

    const profileName =
      document?.profile?.name || document?.user?.name || 'this profile';
    const confirmationMessage =
      status === 'approved'
        ? `Approve the qualification document for ${profileName}?`
        : `Reject the qualification document for ${profileName}?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    dispatch({ type: QUALIFICATION_DOCUMENT_REVIEW_RESET });
    setLoadingStates((prev) => ({
      ...prev,
      reviewDocument: `${document._id}-${status}`,
    }));

    const reviewPayload =
      status === 'approved'
        ? { status: 'approved', rejectionReason: '' }
        : {
            status: 'rejected',
            rejectionReason,
          };

    dispatch(
      reviewQualificationDocumentAction(
        document._id,
        reviewPayload,
        {
          page: currentDocumentPage,
          limit: QUALIFICATION_DOCUMENTS_PER_PAGE,
          filters: getQualificationDocumentAdminFilters(documentStatusFilter),
        },
        {
          page: currentPage,
          limit: profilesPerPage,
        },
      ),
    ).finally(() => {
      setLoadingStates((prev) => ({
        ...prev,
        reviewDocument: null,
      }));
    });
  };

  const handleDownloadQualificationDocument = async (qualificationDocument) => {
    if (!qualificationDocument?._id || !userInfo?.token) {
      return;
    }

    setDownloadError('');
    setLoadingStates((prev) => ({
      ...prev,
      downloadDocument: qualificationDocument._id,
    }));

    try {
      const { data } = await axios.get(
        `/api/profiles/admin/qualification-documents/${qualificationDocument._id}/download`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      const downloadLink = window.document.createElement('a');
      const objectUrl = window.URL.createObjectURL(data);

      downloadLink.href = objectUrl;
      downloadLink.download =
        qualificationDocument.originalFileName || 'qualification-document';
      downloadLink.rel = 'noopener noreferrer';
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      setDownloadErrorVersion((prev) => prev + 1);
      setDownloadError(
        error?.response?.data?.message ||
          error.message ||
          'Failed to download qualification document',
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        downloadDocument: null,
      }));
    }
  };

  const handleOpenRejectEditor = (document) => {
    if (!document?._id) return;

    setRejectValidationError('');
    setRejectEditorDocumentId(document._id);
    setRejectDraftByDocument((prev) => ({
      ...prev,
      [document._id]: prev[document._id] ?? document?.rejectionReason ?? '',
    }));
  };

  const handleCancelRejectEditor = () => {
    setRejectValidationError('');
    setRejectEditorDocumentId(null);
  };

  const handleRejectDraftChange = (documentId, value) => {
    setRejectDraftByDocument((prev) => ({
      ...prev,
      [documentId]: value,
    }));
    if (rejectValidationError) {
      setRejectValidationError('');
    }
  };

  const handleRejectSubmit = (document) => {
    const reason = (rejectDraftByDocument[document?._id] || '').trim();

    if (reason.length < REJECTION_REASON_MIN_LENGTH) {
      setRejectValidationError(
        `Rejection reason must be at least ${REJECTION_REASON_MIN_LENGTH} characters.`,
      );
      return;
    }

    if (reason.length > REJECTION_REASON_MAX_LENGTH) {
      setRejectValidationError(
        `Rejection reason must not exceed ${REJECTION_REASON_MAX_LENGTH} characters.`,
      );
      return;
    }

    handleQualificationDocumentReview(document, 'rejected', reason);
    setRejectValidationError('');
    setRejectEditorDocumentId(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQualificationDocumentPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= qualificationDocumentsPages) {
      setCurrentDocumentPage(newPage);
    }
  };

  const handleDocumentStatusFilterChange = (nextFilter) => {
    if (documentStatusFilter === nextFilter) return;

    setDocumentStatusFilter(nextFilter);
    setCurrentDocumentPage(1);
    setRejectEditorDocumentId(null);
    setRejectValidationError('');
  };

  const prioritizedQualificationDocuments = [
    ...(qualificationDocumentsAdmin || []),
  ].sort((firstDocument, secondDocument) => {
    const firstStatus = firstDocument?.status || '';
    const secondStatus = secondDocument?.status || '';

    if (firstStatus === secondStatus) return 0;
    if (firstStatus === 'pending') return -1;
    if (secondStatus === 'pending') return 1;
    return 0;
  });

  // Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
  };
  const handleSearchClear = () => {
    setKeyword('');
  };
  //SearchInput

  const handleSort = (val) => {
    setSortDirection(val);
  };

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
              {keyword
                ? `Found ${searchedProfiles.length} profile${searchedProfiles.length !== 1 ? 's' : ''} matching '${keyword}'`
                : `Showing ${searchedProfiles.length} profile${searchedProfiles.length !== 1 ? 's' : ''}`}
            </p>

            <section className="qualification-review-section" aria-labelledby="qualification-review-heading">
              <div className="qualification-review-header">
                <div>
                  <h2 id="qualification-review-heading">Qualification Documents</h2>
                  <p>
                    Pending documents are prioritised by default. Use the
                    status filters to switch between pending, approved,
                    rejected, or all active submissions.
                  </p>
                </div>
                <span className="qualification-review-count">
                  {qualificationDocumentsTotal}
                  {' '}
                  {documentStatusFilter === 'all'
                    ? 'active'
                    : getQualificationStatusLabel(documentStatusFilter).toLowerCase()}
                  {' '}
                  document{qualificationDocumentsTotal === 1 ? '' : 's'}
                </span>
              </div>
              <div className="qualification-review-filters" role="group" aria-label="Qualification document status filters">
                {QUALIFICATION_DOCUMENT_STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={`qualification-filter-btn ${
                      documentStatusFilter === filter.value ? 'is-active' : ''
                    }`.trim()}
                    onClick={() =>
                      handleDocumentStatusFilterChange(filter.value)
                    }
                    aria-pressed={documentStatusFilter === filter.value}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {qualificationDocumentReviewError ? (
                <Message
                  message={qualificationDocumentReviewError}
                  variant="error"
                  ariaLive="assertive"
                />
              ) : null}
              {qualificationDocumentReviewSuccess ? (
                <Message
                  message={
                    qualificationDocumentReviewMessage ||
                    'Qualification document reviewed successfully'
                  }
                  variant="success"
                  autoClose={6000}
                  ariaLive="polite"
                />
              ) : null}
              {downloadError ? (
                <Message
                  key={downloadErrorVersion}
                  message={downloadError}
                  variant="error"
                  autoClose={6000}
                  ariaLive="assertive"
                />
              ) : null}
              {qualificationDocumentsLoading ? (
                <LoadingSpinner />
              ) : qualificationDocumentsError ? (
                <Message
                  message={qualificationDocumentsError}
                  variant="error"
                  ariaLive="assertive"
                />
              ) : prioritizedQualificationDocuments.length === 0 ? (
                <p className="qualification-review-empty">
                  No
                  {' '}
                  {documentStatusFilter === 'all'
                    ? 'active'
                    : getQualificationStatusLabel(documentStatusFilter).toLowerCase()}
                  {' '}
                  qualification documents found in this queue.
                </p>
              ) : (
                <>
                  <div className="qualification-review-list">
                    {prioritizedQualificationDocuments.map((document) => {
                      const reviewStatus =
                        document?.status || 'pending';
                      const reviewTargetApprove =
                        loadingStates.reviewDocument ===
                        `${document?._id}-approved`;
                      const reviewTargetReject =
                        loadingStates.reviewDocument ===
                        `${document?._id}-rejected`;
                      const isReviewingDocument =
                        loadingStates.reviewDocument?.startsWith(
                          `${document?._id}-`,
                        ) || false;
                      const isRejectEditorOpenForDocument =
                        rejectEditorDocumentId === document?._id;

                      return (
                        <article
                          key={document?._id}
                          className="qualification-review-card"
                        >
                          <div className="qualification-review-card-header">
                            <div className="qualification-review-profile">
                              <strong>
                                {document?.profile?.name ||
                                  document?.user?.name ||
                                  'Unnamed profile'}
                              </strong>
                              <span>
                                {document?.profile?.email ||
                                  document?.user?.email ||
                                  'No email available'}
                              </span>
                              {document?.profile?.telephoneNumber ? (
                                <span>{document.profile.telephoneNumber}</span>
                              ) : null}
                            </div>
                            <span
                              className={`status-badge status-${reviewStatus}`}
                            >
                              <i
                                className={`fa ${getQualificationStatusIcon(
                                  reviewStatus,
                                )}`}
                                aria-hidden="true"
                              ></i>
                              {getQualificationStatusLabel(reviewStatus)}
                            </span>
                          </div>

                          <div className="qualification-review-details">
                            <div className="qualification-review-detail">
                              <span>Document</span>
                              <strong>
                                {document?.originalFileName || 'Unknown file'}
                              </strong>
                            </div>
                            <div className="qualification-review-detail">
                              <span>Uploaded</span>
                              <strong>
                                {document?.createdAt
                                  ? moment(document.createdAt).format(
                                      'D MMM YYYY',
                                    )
                                  : 'Unknown'}
                              </strong>
                            </div>
                            <div className="qualification-review-detail">
                              <span>Profile Status</span>
                              <strong>
                                {getQualificationStatusLabel(
                                  getProfileQualificationStatus(
                                    document?.profile,
                                  ),
                                )}
                              </strong>
                            </div>
                          </div>

                          {document?.rejectionReason ? (
                            <p className="qualification-review-reason">
                              Reason:
                              {' '}
                              {document.rejectionReason}
                            </p>
                          ) : null}

                          <div className="qualification-review-actions">
                            <Button
                              type="button"
                              text={
                                loadingStates.downloadDocument === document._id
                                  ? 'Downloading...'
                                  : 'Download'
                              }
                              title="Download certificate"
                              onClick={() =>
                                handleDownloadQualificationDocument(document)
                              }
                              disabled={
                                !document?._id ||
                                loadingStates.downloadDocument === document._id
                              }
                            />
                            <Button
                              type="button"
                              text={
                                reviewTargetApprove
                                  ? 'Approving...'
                                  : 'Approve'
                              }
                              title="Approve qualification document"
                              onClick={() =>
                                handleQualificationDocumentReview(
                                  document,
                                  'approved',
                                )
                              }
                              disabled={
                                !document?._id ||
                                isReviewingDocument ||
                                isRejectEditorOpenForDocument ||
                                reviewStatus === 'approved'
                              }
                            />
                            <Button
                              type="button"
                              text={
                                reviewTargetReject
                                  ? 'Rejecting...'
                                  : 'Reject'
                              }
                              title="Reject qualification document"
                              onClick={() => handleOpenRejectEditor(document)}
                              disabled={
                                !document?._id ||
                                isReviewingDocument ||
                                isRejectEditorOpenForDocument ||
                                reviewStatus === 'rejected'
                              }
                            />
                          </div>
                          {rejectEditorDocumentId === document?._id ? (
                            <div className="qualification-reject-editor">
                              <label
                                className="qualification-reject-label"
                                htmlFor={`rejection-reason-${document?._id}`}
                              >
                                Rejection reason
                              </label>
                              <textarea
                                id={`rejection-reason-${document?._id}`}
                                value={rejectDraftByDocument[document?._id] || ''}
                                onChange={(event) =>
                                  handleRejectDraftChange(
                                    document?._id,
                                    event.target.value,
                                  )
                                }
                                maxLength={REJECTION_REASON_MAX_LENGTH}
                                placeholder={`Provide actionable feedback (${REJECTION_REASON_MIN_LENGTH}-${REJECTION_REASON_MAX_LENGTH} characters).`}
                                aria-describedby={`rejection-reason-help-${document?._id}`}
                              ></textarea>
                              <p
                                className="qualification-reject-help"
                                id={`rejection-reason-help-${document?._id}`}
                              >
                                {(rejectDraftByDocument[document?._id] || '').trim()
                                  .length}
                                /{REJECTION_REASON_MAX_LENGTH}
                              </p>
                              {rejectValidationError ? (
                                <p
                                  className="qualification-reject-error"
                                  role="alert"
                                >
                                  {rejectValidationError}
                                </p>
                              ) : null}
                              <div className="qualification-reject-actions">
                                <button
                                  type="button"
                                  className="btn not-disabled"
                                  onClick={() => handleRejectSubmit(document)}
                                  disabled={isReviewingDocument}
                                >
                                  Submit Rejection
                                </button>
                                <button
                                  type="button"
                                  className="btn not-disabled"
                                  onClick={handleCancelRejectEditor}
                                  disabled={isReviewingDocument}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>

                  {qualificationDocumentsPages > 1 ? (
                    <div className="qualification-review-pagination">
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() =>
                          handleQualificationDocumentPageChange(
                            currentDocumentPage - 1,
                          )
                        }
                        disabled={currentDocumentPage === 1}
                      >
                        Previous Documents
                      </button>
                      <span>
                        Document page
                        {' '}
                        {qualificationDocumentsPage}
                        {' '}
                        of
                        {' '}
                        {qualificationDocumentsPages}
                      </span>
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() =>
                          handleQualificationDocumentPageChange(
                            currentDocumentPage + 1,
                          )
                        }
                        disabled={
                          currentDocumentPage === qualificationDocumentsPages
                        }
                      >
                        Next Documents
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </section>

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
                          aria-pressed={sortDirection === 'ratingUp'}
                          className="sort-button"
                          title="Sort ascending"
                        >
                          <i className="arrow fas fa-arrow-up" aria-hidden="true"></i>
                        </button>
                        <span>Rating</span>
                        <button
                          onClick={() => handleSort('ratingDown')}
                          aria-label="Sort by rating descending"
                          aria-pressed={sortDirection === 'ratingDown'}
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
                        <span
                          className={`status-badge status-${getProfileQualificationStatus(
                            profile,
                          )}`}
                        >
                          <i
                            className={`fa ${getQualificationStatusIcon(
                              getProfileQualificationStatus(profile),
                            )}`}
                            aria-hidden="true"
                          ></i>
                          {getQualificationStatusLabel(
                            getProfileQualificationStatus(profile),
                          )}
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
                      <span
                        className={`status-badge status-${getProfileQualificationStatus(
                          profile,
                        )}`}
                      >
                        {getQualificationStatusLabel(
                          getProfileQualificationStatus(profile),
                        )}
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

const AdminProfileView = () => (
  <AdminAccessGate>
    <AdminProfileViewContent />
  </AdminAccessGate>
);

export default AdminProfileView;
