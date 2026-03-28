/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import AdminUserView from './AdminUserView';

const mockedActions = vi.hoisted(() => ({
  usersAction: vi.fn(() => ({ type: 'USERS_ACTION' })),
  deleteUserAction: vi.fn((id) => ({ type: 'DELETE_USER_ACTION', payload: id })),
  userAddRemoveAdminAction: vi.fn((payload) => ({
    type: 'USER_ADD_REMOVE_ADMIN_ACTION',
    payload,
  })),
}));

vi.mock('../../store/actions/userActions', () => ({
  usersAction: mockedActions.usersAction,
  deleteUserAction: mockedActions.deleteUserAction,
  userAddRemoveAdminAction: mockedActions.userAddRemoveAdminAction,
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
    users: {
      loading: false,
      error: null,
      userProfiles: [],
    },
  };

  const state = {
    ...baseState,
    ...stateOverrides,
    userLogin: {
      ...baseState.userLogin,
      ...(stateOverrides.userLogin || {}),
    },
    users: {
      ...baseState.users,
      ...(stateOverrides.users || {}),
    },
  };

  const store = createStore(state);

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AdminUserView />
      </MemoryRouter>
    </Provider>,
  );
};

describe('AdminUserView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('blocks non-admin users before fetching the users list', () => {
    renderView();

    expect(screen.getByText('Not authorised as an ADMIN')).toBeTruthy();
    expect(screen.queryByText('Users')).toBeNull();
    expect(mockedActions.usersAction).not.toHaveBeenCalled();
  });
});
