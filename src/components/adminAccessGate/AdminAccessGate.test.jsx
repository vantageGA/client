/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import AdminAccessGate from './AdminAccessGate';

const createStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: vi.fn(),
});

const renderGate = (userInfo) => {
  const store = createStore({
    userLogin: {
      userInfo,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminAccessGate>
                <div>Secret admin content</div>
              </AdminAccessGate>
            }
          />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('AdminAccessGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('redirects unauthenticated users home', () => {
    renderGate(null);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Secret admin content')).toBeNull();
  });

  it('shows an admin access error for non-admin users', () => {
    renderGate({
      token: 'token',
      isAdmin: false,
    });

    expect(screen.getByText('Not authorised as an ADMIN')).toBeTruthy();
    expect(screen.queryByText('Secret admin content')).toBeNull();
  });

  it('renders children for admin users', () => {
    renderGate({
      token: 'token',
      isAdmin: true,
    });

    expect(screen.getByText('Secret admin content')).toBeTruthy();
  });
});
