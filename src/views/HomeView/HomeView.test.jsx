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
  default: ({ name }) => <div data-testid="profile-card">{name}</div>,
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

const renderHome = (initialSearch = 'trainer') =>
  render(
    <MemoryRouter initialEntries={[`/?search=${initialSearch}`]}>
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
    expect(input).toHaveFocus();

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

  it('prioritises matching profile names over the API result order', () => {
    const dispatch = vi.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({
      loading: false,
      error: null,
      profiles: [
        {
          _id: 'profile-one',
          name: 'Body Conditioning Studio',
          description: 'General training and wellbeing profile.',
          rating: 5,
          numReviews: 20,
        },
        {
          _id: 'profile-two',
          name: 'Peter Williams',
          description: 'Personal trainer.',
          rating: 0,
          numReviews: 0,
        },
      ],
      page: 1,
      pages: 1,
      total: 2,
    });

    renderHome('Peter');

    const cards = screen.getAllByTestId('profile-card');

    expect(cards[0]).toHaveTextContent('Peter Williams');
  });

  it('prioritises natural service and location searches over generic matches', () => {
    const dispatch = vi.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({
      loading: false,
      error: null,
      profiles: [
        {
          _id: 'profile-one',
          name: 'Central Wellness',
          description: 'General wellbeing services across the London area.',
          location: 'London',
          rating: 5,
          numReviews: 20,
        },
        {
          _id: 'profile-two',
          name: 'Lean Strength Coaching',
          description: 'Weight loss coaching and sustainable body composition plans.',
          keywords: ['weight loss', 'fat loss'],
          specialisationOne: 'Weight Loss',
          location: 'London',
          rating: 0,
          numReviews: 0,
        },
      ],
      page: 1,
      pages: 1,
      total: 2,
    });

    renderHome('Weight loss London area');

    const cards = screen.getAllByTestId('profile-card');

    expect(cards[0]).toHaveTextContent('Lean Strength Coaching');
  });
});
