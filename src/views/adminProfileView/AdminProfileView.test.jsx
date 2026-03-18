/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import AdminProfileView from './AdminProfileView';

const mockedActions = vi.hoisted(() => ({
  profilesAdminAction: vi.fn((page, limit) => ({
    type: 'PROFILES_ADMIN_ACTION',
    payload: { page, limit },
  })),
  deleteProfileAction: vi.fn((id) => ({
    type: 'DELETE_PROFILE_ACTION',
    payload: id,
  })),
  deleteReviewProfileAction: vi.fn((profileId, reviewId) => ({
    type: 'DELETE_REVIEW_PROFILE_ACTION',
    payload: { profileId, reviewId },
  })),
  qualificationDocumentsAdminAction: vi.fn((page, limit, filters) => ({
    type: 'QUALIFICATION_DOCUMENTS_ADMIN_ACTION',
    payload: { page, limit, filters },
  })),
  reviewQualificationDocumentAction: vi.fn(
    (id, reviewData, refreshListOptions, refreshProfileOptions) => ({
      type: 'REVIEW_QUALIFICATION_DOCUMENT_ACTION',
      payload: {
        id,
        reviewData,
        refreshListOptions,
        refreshProfileOptions,
      },
    }),
  ),
}));

vi.mock('../../store/actions/profileActions', () => ({
  profilesAdminAction: mockedActions.profilesAdminAction,
  deleteProfileAction: mockedActions.deleteProfileAction,
  deleteReviewProfileAction: mockedActions.deleteReviewProfileAction,
}));

vi.mock('../../store/actions/qualificationDocumentActions', () => ({
  qualificationDocumentsAdminAction:
    mockedActions.qualificationDocumentsAdminAction,
  reviewQualificationDocumentAction:
    mockedActions.reviewQualificationDocumentAction,
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

const createStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: vi.fn(() => Promise.resolve()),
});

const buildProfile = (overrides = {}) => ({
  _id: 'profile-1',
  name: 'Ben Smith',
  email: 'ben@example.com',
  telephoneNumber: '07123 456789',
  profileImage: '/avatar.jpg',
  description: 'Experienced trainer.',
  location: 'Guildford',
  rating: 4.8,
  numReviews: 0,
  reviews: [],
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-05T12:00:00.000Z',
  qualificationVerificationStatus: 'pending',
  isQualificationsVerified: false,
  ...overrides,
});

const buildQualificationDocument = (overrides = {}) => ({
  _id: 'doc-1',
  originalFileName: 'pt-certificate.pdf',
  status: 'pending',
  isActive: true,
  createdAt: '2026-03-10T12:00:00.000Z',
  rejectionReason: '',
  profile: buildProfile(),
  user: {
    name: 'Ben Smith',
    email: 'ben@example.com',
  },
  ...overrides,
});

const renderView = (stateOverrides = {}) => {
  const baseState = {
    userLogin: {
      userInfo: {
        token: 'token',
        isAdmin: true,
      },
    },
    profilesAdmin: {
      loading: false,
      error: null,
      success: false,
      profilesAdmin: [buildProfile()],
      page: 1,
      pages: 1,
      total: 1,
    },
    qualificationDocumentsAdmin: {
      loading: false,
      error: null,
      documents: [buildQualificationDocument()],
      page: 1,
      pages: 1,
      total: 1,
    },
    qualificationDocumentReview: {
      loading: false,
      success: false,
      error: null,
      message: null,
    },
  };

  const state = {
    ...baseState,
    ...stateOverrides,
    userLogin: {
      ...baseState.userLogin,
      ...(stateOverrides.userLogin || {}),
    },
    profilesAdmin: {
      ...baseState.profilesAdmin,
      ...(stateOverrides.profilesAdmin || {}),
    },
    qualificationDocumentsAdmin: {
      ...baseState.qualificationDocumentsAdmin,
      ...(stateOverrides.qualificationDocumentsAdmin || {}),
    },
    qualificationDocumentReview: {
      ...baseState.qualificationDocumentReview,
      ...(stateOverrides.qualificationDocumentReview || {}),
    },
  };

  const store = createStore(state);
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <AdminProfileView />
      </MemoryRouter>
    </Provider>,
  );

  return { ...view, store };
};

describe('AdminProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the qualification documents review panel with status and upload date', () => {
    renderView();

    const reviewSection = screen
      .getByRole('heading', { name: 'Qualification Documents' })
      .closest('section');
    const table = screen.getByRole('table');

    expect(reviewSection).toBeTruthy();
    expect(
      within(reviewSection).getByText('pt-certificate.pdf'),
    ).toBeTruthy();
    expect(
      within(reviewSection).getAllByText('Pending Review'),
    ).toHaveLength(2);
    expect(within(reviewSection).getByText('10 Mar 2026')).toBeTruthy();
    expect(within(table).getByText('Pending Review')).toBeTruthy();
    expect(mockedActions.qualificationDocumentsAdminAction).toHaveBeenCalledWith(
      1,
      10,
      {
        isActive: true,
        status: 'pending',
      },
    );
  });

  it('changes the document queue filter and refetches with selected status', () => {
    renderView();
    const reviewSection = screen
      .getByRole('heading', { name: 'Qualification Documents' })
      .closest('section');

    fireEvent.click(within(reviewSection).getByRole('button', { name: 'Approved' }));

    expect(mockedActions.qualificationDocumentsAdminAction).toHaveBeenCalledWith(
      1,
      10,
      {
        isActive: true,
        status: 'approved',
      },
    );
  });

  it('dispatches approve review with document and profile refresh options', () => {
    renderView();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const reviewSection = screen
      .getByRole('heading', { name: 'Qualification Documents' })
      .closest('section');

    fireEvent.click(within(reviewSection).getByRole('button', { name: 'Approve' }));

    expect(confirmSpy).toHaveBeenCalledWith(
      'Approve the qualification document for Ben Smith?',
    );
    expect(mockedActions.reviewQualificationDocumentAction).toHaveBeenCalledWith(
      'doc-1',
      {
        status: 'approved',
        rejectionReason: '',
      },
      {
        page: 1,
        limit: 10,
        filters: { isActive: true, status: 'pending' },
      },
      {
        page: 1,
        limit: 50,
      },
    );

    confirmSpy.mockRestore();
  });

  it('requires a rejection reason and dispatches reject review with admin feedback', () => {
    renderView();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const reviewSection = screen
      .getByRole('heading', { name: 'Qualification Documents' })
      .closest('section');

    fireEvent.click(within(reviewSection).getByRole('button', { name: 'Reject' }));

    const rejectionReasonField = within(reviewSection).getByLabelText(
      'Rejection reason',
    );
    fireEvent.change(rejectionReasonField, { target: { value: 'Too short' } });
    fireEvent.click(
      within(reviewSection).getByRole('button', { name: 'Submit Rejection' }),
    );

    expect(
      within(reviewSection).getByText(
        'Rejection reason must be at least 10 characters.',
      ),
    ).toBeTruthy();

    fireEvent.change(rejectionReasonField, {
      target: {
        value:
          'Please upload a clearer document and include all qualification details.',
      },
    });
    fireEvent.click(
      within(reviewSection).getByRole('button', { name: 'Submit Rejection' }),
    );

    expect(confirmSpy).toHaveBeenCalledWith(
      'Reject the qualification document for Ben Smith?',
    );
    expect(mockedActions.reviewQualificationDocumentAction).toHaveBeenCalledWith(
      'doc-1',
      {
        status: 'rejected',
        rejectionReason:
          'Please upload a clearer document and include all qualification details.',
      },
      {
        page: 1,
        limit: 10,
        filters: { isActive: true, status: 'pending' },
      },
      {
        page: 1,
        limit: 50,
      },
    );

    confirmSpy.mockRestore();
  });

  it('renders queue empty-state messaging for the active filter', () => {
    renderView({
      qualificationDocumentsAdmin: {
        loading: false,
        error: null,
        documents: [],
        page: 1,
        pages: 1,
        total: 0,
      },
    });

    expect(
      screen.getByText('No pending review qualification documents found in this queue.'),
    ).toBeTruthy();
  });

  it('renders qualification review success messaging from review transitions', () => {
    renderView({
      qualificationDocumentReview: {
        loading: false,
        success: true,
        error: null,
        message: 'Qualification document approved',
      },
    });

    expect(screen.getByText('Qualification document approved')).toBeTruthy();
  });

  it('renders qualification review error messaging from review transitions', () => {
    renderView({
      qualificationDocumentReview: {
        loading: false,
        success: false,
        error: 'Review request failed',
        message: null,
      },
    });

    expect(screen.getByText('Review request failed')).toBeTruthy();
  });
});
