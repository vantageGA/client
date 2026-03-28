/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import AdminReviewersView from './AdminReviewersView';

const mockedActions = vi.hoisted(() => ({
  userAdminReviewersDetailsAction: vi.fn(() => ({
    type: 'USER_ADMIN_REVIEWERS_DETAILS_ACTION',
  })),
  deleteReviewerAdminAction: vi.fn((id) => ({
    type: 'DELETE_REVIEWER_ADMIN_ACTION',
    payload: id,
  })),
}));

vi.mock('../../store/actions/userReviewActions', () => ({
  userAdminReviewersDetailsAction:
    mockedActions.userAdminReviewersDetailsAction,
  deleteReviewerAdminAction: mockedActions.deleteReviewerAdminAction,
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

const createStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: vi.fn(() => Promise.resolve()),
});

const renderView = (stateOverrides = {}) => {
  const baseState = {
    userLogin: {
      userInfo: {
        token: 'token',
        isAdmin: false,
      },
    },
    userAdminReviewersDetails: {
      loading: false,
      error: null,
      reviewers: [],
    },
  };

  const state = {
    ...baseState,
    ...stateOverrides,
    userLogin: {
      ...baseState.userLogin,
      ...(stateOverrides.userLogin || {}),
    },
    userAdminReviewersDetails: {
      ...baseState.userAdminReviewersDetails,
      ...(stateOverrides.userAdminReviewersDetails || {}),
    },
  };

  const store = createStore(state);

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AdminReviewersView />
      </MemoryRouter>
    </Provider>,
  );
};

describe('AdminReviewersView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('blocks non-admin users before fetching reviewers', () => {
    renderView();

    expect(screen.getByText('Not authorised as an ADMIN')).toBeTruthy();
    expect(screen.queryByText('Reviewers Details')).toBeNull();
    expect(mockedActions.userAdminReviewersDetailsAction).not.toHaveBeenCalled();
  });
});
