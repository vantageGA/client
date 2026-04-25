/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import HomeView from './HomeView';

const mockedProfilesAction = vi.hoisted(() =>
  vi.fn((page, limit, filters) => ({
    type: 'PROFILES_ACTION',
    meta: { page, limit, filters },
  })),
);

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('../../store/actions/profileActions', () => ({
  profilesAction: mockedProfilesAction,
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('../../components/card/Card', () => ({
  default: ({ name }) => <div>{name}</div>,
}));

vi.mock('../../components/bodyVantage/BodyVantage', () => ({
  default: () => <span>Body Vantage</span>,
}));

const LocationControls = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div data-testid="location">{location.search}</div>
      <button type="button" onClick={() => navigate('/?search=barber')}>
        Set barber
      </button>
    </>
  );
};

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/?search=trainer']}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <LocationControls />
              <HomeView />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('HomeView', () => {
  it('keeps the search input in sync when the URL search query changes', async () => {
    const dispatch = vi.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({
      loading: false,
      error: null,
      profiles: [],
      page: 1,
      pages: 1,
      total: 0,
    });

    renderHome();

    const input = screen.getByLabelText(
      'Search for verified professionals by specialty or location',
    );

    expect(input.value).toBe('trainer');

    fireEvent.click(screen.getByRole('button', { name: 'Set barber' }));

    await waitFor(() => {
      expect(input.value).toBe('barber');
    });
    await waitFor(() => {
      expect(mockedProfilesAction).toHaveBeenCalledWith(1, 20, {
        search: 'barber',
      });
    });
  });
});
