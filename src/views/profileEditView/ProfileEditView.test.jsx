/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import ProfileEditView from './ProfileEditView';

const mockedActions = vi.hoisted(() => ({
  profileOfLoggedInUserAction: vi.fn(() => ({
    type: 'PROFILE_OF_LOGGED_IN_USER_ACTION',
  })),
  createProfileAction: vi.fn(() => ({ type: 'CREATE_PROFILE_ACTION' })),
  profileUpdateAction: vi.fn((payload) => ({
    type: 'PROFILE_UPDATE_ACTION',
    payload,
  })),
  profileImagesAction: vi.fn(() => ({ type: 'PROFILE_IMAGES_ACTION' })),
  updateOnboardingTutorialAction: vi.fn(() => ({
    type: 'PROFILE_ONBOARDING_TUTORIAL_UPDATE_ACTION',
  })),
  profileImageUploadAction: vi.fn(() => ({
    type: 'PROFILE_IMAGE_UPLOAD_ACTION',
  })),
  deleteProfileImageAction: vi.fn(() => ({
    type: 'DELETE_PROFILE_IMAGE_ACTION',
  })),
}));

vi.mock('../../store/actions/profileActions', () => ({
  profileOfLoggedInUserAction: mockedActions.profileOfLoggedInUserAction,
  createProfileAction: mockedActions.createProfileAction,
  profileUpdateAction: mockedActions.profileUpdateAction,
  profileImagesAction: mockedActions.profileImagesAction,
  updateOnboardingTutorialAction: mockedActions.updateOnboardingTutorialAction,
}));

vi.mock('../../store/actions/imageUploadActions', () => ({
  profileImageUploadAction: mockedActions.profileImageUploadAction,
  deleteProfileImageAction: mockedActions.deleteProfileImageAction,
}));

vi.mock('../../components/quillEditor/QuillEditor', () => ({
  default: React.forwardRef(({ id, value, onChange, className = '' }, ref) => (
    <textarea
      id={id}
      ref={ref}
      data-testid={id || 'quill-editor'}
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )),
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('../../components/rating/Rating', () => ({
  default: () => <div>Rating</div>,
}));

vi.mock('../../components/socialMedia/faceBook/FaceBookComponent', () => ({
  default: () => <div>Facebook</div>,
}));

vi.mock('../../components/socialMedia/Instagram/InstagramComponent', () => ({
  default: () => <div>Instagram</div>,
}));

vi.mock('../../components/info/InfoComponent', () => ({
  default: () => <div>Info</div>,
}));

vi.mock('../../components/onboardingTutorial/OnboardingTutorial', () => ({
  default: () => <div>Onboarding tutorial</div>,
}));

const createStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: vi.fn(),
});

const buildProfile = () => ({
  _id: 'profile-1',
  name: 'Ben Smith',
  email: 'ben@example.com',
  faceBook: '',
  instagram: '',
  websiteUrl: '',
  profileImage: '',
  description: '<p>Experienced trainer working across Surrey.</p>',
  specialisation: '<p>Strength and conditioning coaching.</p>',
  qualifications: '<p>Level 3 Personal Trainer.</p>',
  location: 'Guildford, Surrey',
  telephoneNumber: '07123 456789',
  keyWordSearchOne: 'fitness',
  keyWordSearchTwo: 'strength',
  keyWordSearchThree: 'nutrition',
  keyWordSearchFour: 'mobility',
  keyWordSearchFive: 'coaching',
  specialisationOne: 'Strength',
  specialisationTwo: 'Mobility',
  specialisationThree: 'Nutrition',
  specialisationFour: 'Recovery',
  onboardingTutorial: {
    required: true,
    isCompleted: true,
    watchProgressPercent: 100,
  },
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-02T12:00:00.000Z',
  rating: 0,
  numReviews: 0,
  isQualificationsVerified: false,
});

const renderView = () => {
  const state = {
    userLogin: {
      userInfo: {
        token: 'token',
      },
    },
    profileOfLoggedInUser: {
      loading: false,
      error: null,
      profile: buildProfile(),
    },
    profileCreate: {
      loading: false,
      error: null,
    },
    profileImage: {
      loading: false,
    },
    profileUpdate: {
      success: false,
      error: null,
      errorCode: null,
    },
    profileOnboardingTutorialUpdate: {
      loading: false,
      error: null,
      onboardingTutorial: null,
    },
    profileImages: {
      error: null,
      profileImages: [],
    },
  };

  const store = createStore(state);
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <ProfileEditView />
      </MemoryRouter>
    </Provider>,
  );

  return { ...view, store };
};

describe('ProfileEditView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('disables native form validation and normalizes telephone numbers before update', async () => {
    const { container } = renderView();

    const forms = container.querySelectorAll('form');
    expect(forms[0].hasAttribute('novalidate')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Profile Basics' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save profile basics' }));

    expect(mockedActions.profileUpdateAction).toHaveBeenCalledTimes(1);
    expect(mockedActions.profileUpdateAction).toHaveBeenCalledWith(
      expect.objectContaining({
        telephoneNumber: '07123456789',
      }),
    );
  });

  it('shows live preview updates for Quill-backed fields', () => {
    renderView();
    const descriptionEditors = screen.getAllByTestId('profile-description');
    const quillEditors = screen.getAllByTestId('quill-editor');
    const summaryFieldset = screen.getByText('Profile Summary').closest('fieldset');

    fireEvent.change(descriptionEditors[0], {
      target: { value: 'Live description preview' },
    });
    fireEvent.change(quillEditors[0], {
      target: { value: 'Live specialisation preview' },
    });
    fireEvent.change(quillEditors[1], {
      target: { value: 'Live qualifications preview' },
    });

    expect(within(summaryFieldset).getByText('Live description preview')).toBeTruthy();
    expect(within(summaryFieldset).getByText('Live specialisation preview')).toBeTruthy();
    expect(within(summaryFieldset).getByText('Live qualifications preview')).toBeTruthy();
  });

  it('shows a specialisation character count and blocks saves over 400 characters', () => {
    renderView();
    const specialisationEditor = screen.getAllByTestId('quill-editor')[0];

    fireEvent.click(screen.getByRole('button', { name: 'Specialisation' }));
    expect(screen.getByText('35 / 400 characters')).toBeTruthy();

    fireEvent.change(specialisationEditor, {
      target: { value: 'a'.repeat(401) },
    });

    expect(screen.getByText('401 / 400 characters')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save specialisation' }));

    expect(mockedActions.profileUpdateAction).not.toHaveBeenCalled();
    expect(
      screen.getAllByText('Specialisation must not exceed 400 characters (401 entered)')
        .length,
    ).toBeGreaterThan(0);
  });
});
