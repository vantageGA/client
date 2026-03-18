/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
  qualificationDocumentsAction: vi.fn(() => ({
    type: 'QUALIFICATION_DOCUMENTS_ACTION',
  })),
  uploadQualificationDocumentAction: vi.fn((formData, options) => ({
    type: 'UPLOAD_QUALIFICATION_DOCUMENT_ACTION',
    payload: {
      fileName: formData.get('qualificationDocument')?.name,
      options,
    },
  })),
  replaceQualificationDocumentAction: vi.fn((id, formData, options) => ({
    type: 'REPLACE_QUALIFICATION_DOCUMENT_ACTION',
    payload: {
      id,
      fileName: formData.get('qualificationDocument')?.name,
      options,
    },
  })),
  deleteQualificationDocumentAction: vi.fn((id, options) => ({
    type: 'DELETE_QUALIFICATION_DOCUMENT_ACTION',
    payload: {
      id,
      options,
    },
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

vi.mock('../../store/actions/qualificationDocumentActions', () => ({
  deleteQualificationDocumentAction:
    mockedActions.deleteQualificationDocumentAction,
  qualificationDocumentsAction: mockedActions.qualificationDocumentsAction,
  replaceQualificationDocumentAction:
    mockedActions.replaceQualificationDocumentAction,
  uploadQualificationDocumentAction:
    mockedActions.uploadQualificationDocumentAction,
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

const buildProfile = (overrides = {}) => ({
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
  ...overrides,
});

const buildQualificationDocument = (overrides = {}) => ({
  _id: 'doc-1',
  originalFileName: 'pt-certificate.pdf',
  status: 'pending',
  isActive: true,
  createdAt: '2026-03-10T12:00:00.000Z',
  ...overrides,
});

const renderView = (stateOverrides = {}) => {
  const baseState = {
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
    qualificationDocuments: {
      loading: false,
      error: null,
      documents: [],
      activeDocumentId: null,
      profileStatus: 'none',
    },
    qualificationDocumentUpload: {
      loading: false,
      success: false,
      error: null,
    },
    qualificationDocumentReplace: {
      loading: false,
      success: false,
      error: null,
      message: null,
    },
    qualificationDocumentDelete: {
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
    profileOfLoggedInUser: {
      ...baseState.profileOfLoggedInUser,
      ...(stateOverrides.profileOfLoggedInUser || {}),
    },
    profileCreate: {
      ...baseState.profileCreate,
      ...(stateOverrides.profileCreate || {}),
    },
    profileImage: {
      ...baseState.profileImage,
      ...(stateOverrides.profileImage || {}),
    },
    profileUpdate: {
      ...baseState.profileUpdate,
      ...(stateOverrides.profileUpdate || {}),
    },
    profileOnboardingTutorialUpdate: {
      ...baseState.profileOnboardingTutorialUpdate,
      ...(stateOverrides.profileOnboardingTutorialUpdate || {}),
    },
    profileImages: {
      ...baseState.profileImages,
      ...(stateOverrides.profileImages || {}),
    },
    qualificationDocuments: {
      ...baseState.qualificationDocuments,
      ...(stateOverrides.qualificationDocuments || {}),
    },
    qualificationDocumentUpload: {
      ...baseState.qualificationDocumentUpload,
      ...(stateOverrides.qualificationDocumentUpload || {}),
    },
    qualificationDocumentReplace: {
      ...baseState.qualificationDocumentReplace,
      ...(stateOverrides.qualificationDocumentReplace || {}),
    },
    qualificationDocumentDelete: {
      ...baseState.qualificationDocumentDelete,
      ...(stateOverrides.qualificationDocumentDelete || {}),
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

  it('renders pending qualification status in the profile summary', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [buildQualificationDocument()],
        activeDocumentId: 'doc-1',
        profileStatus: 'pending',
      },
    });

    const summaryFieldset = screen.getByText('Profile Summary').closest('fieldset');

    expect(within(summaryFieldset).getByText('Qualification Status')).toBeTruthy();
    expect(within(summaryFieldset).getByText('Pending Review')).toBeTruthy();
    expect(
      within(summaryFieldset).getByText(
        'Submitted on 10 Mar 2026 and awaiting review.',
      ),
    ).toBeTruthy();
  });

  it('keeps the verified summary treatment for approved qualification status', () => {
    renderView({
      profileOfLoggedInUser: {
        loading: false,
        error: null,
        profile: buildProfile({
          isQualificationsVerified: true,
          qualificationVerificationStatus: 'approved',
        }),
      },
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [
          buildQualificationDocument({
            _id: 'doc-1',
            status: 'approved',
            reviewedAt: '2026-03-16T12:00:00.000Z',
          }),
        ],
        activeDocumentId: 'doc-1',
        profileStatus: 'approved',
      },
    });

    const summaryFieldset = screen.getByText('Profile Summary').closest('fieldset');
    const verifiedStatus = within(summaryFieldset).getByText('Verified');

    expect(within(summaryFieldset).getByText('Qualification Status')).toBeTruthy();
    expect(verifiedStatus).toBeTruthy();
    expect(verifiedStatus.className).toContain('confirmed');
    expect(
      within(summaryFieldset).getByText('Approved on 16 Mar 2026.'),
    ).toBeTruthy();
  });

  it('renders the qualifications and documents section with document guidance', () => {
    renderView();

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );
    const qualificationSection = screen
      .getByText('Qualification Document')
      .closest('.qualification-documents-section');

    expect(qualificationSection).toBeTruthy();
    expect(
      within(qualificationSection).getByText(
        /Supported formats are PDF, JPG, and PNG up to 5MB\./,
      ),
    ).toBeTruthy();
    expect(within(qualificationSection).getByText('Status: Not Submitted')).toBeTruthy();
    expect(
      within(qualificationSection).getByText(
        'Upload a qualification document to start the verification process for your profile.',
      ),
    ).toBeTruthy();
    expect(
      within(qualificationSection).getByText('No qualification document uploaded yet.'),
    ).toBeTruthy();
    expect(within(qualificationSection).getByText('Not Submitted')).toBeTruthy();
  });

  it('renders pending status messaging for an active uploaded document', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [buildQualificationDocument()],
        activeDocumentId: 'doc-1',
        profileStatus: 'pending',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    expect(screen.getByText('Status: Pending')).toBeTruthy();
    expect(
      screen.getByText(
        'Your latest qualification document has been received and is waiting for review.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Submitted on 10 Mar 2026.')).toBeTruthy();
  });

  it('shows qualification-document loading state inside the section', () => {
    renderView({
      qualificationDocuments: {
        loading: true,
        error: null,
        documents: [],
        activeDocumentId: null,
        profileStatus: 'none',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    const qualificationSection = screen
      .getByText('Qualification Document')
      .closest('.qualification-documents-section');
    expect(within(qualificationSection).getByText('Loading...')).toBeTruthy();
  });

  it('shows qualification-document list error state inside the section', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: 'Unable to load qualification documents',
        documents: [],
        activeDocumentId: null,
        profileStatus: 'none',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    expect(
      screen.getByText('Unable to load qualification documents'),
    ).toBeTruthy();
  });

  it('renders rejected status messaging with rejection reason', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [
          buildQualificationDocument({
            _id: 'doc-1',
            status: 'rejected',
            rejectionReason: 'Please upload a clearer document.',
            reviewedAt: '2026-03-14T12:00:00.000Z',
          }),
        ],
        activeDocumentId: 'doc-1',
        profileStatus: 'rejected',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );
    const qualificationSection = screen
      .getByText('Qualification Document')
      .closest('.qualification-documents-section');

    expect(within(qualificationSection).getByText('Status: Rejected')).toBeTruthy();
    expect(
      within(qualificationSection).getByText(
        'Your latest qualification document was reviewed but could not be approved yet. Please replace it with an updated file.',
      ),
    ).toBeTruthy();
    expect(
      within(qualificationSection).getByText(
        'Reason: Please upload a clearer document.',
      ),
    ).toBeTruthy();
  });

  it('renders approved status messaging when the document is verified', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [
          buildQualificationDocument({
            _id: 'doc-1',
            status: 'approved',
            reviewedAt: '2026-03-16T12:00:00.000Z',
          }),
        ],
        activeDocumentId: 'doc-1',
        profileStatus: 'approved',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );
    const qualificationSection = screen
      .getByText('Qualification Document')
      .closest('.qualification-documents-section');

    expect(within(qualificationSection).getByText('Status: Approved')).toBeTruthy();
    expect(
      within(qualificationSection).getByText(
        'Your qualification document has been approved and your verification status is active on supported profile surfaces.',
      ),
    ).toBeTruthy();
    expect(
      within(qualificationSection).getByText('Approved on 16 Mar 2026.'),
    ).toBeTruthy();
  });

  it('uploads a selected qualification document from the new upload UI', () => {
    renderView();

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    const fileInput = screen.getByLabelText('Select qualification document');
    const file = new File(['qualification'], 'certificate.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(screen.getByText('Selected document')).toBeTruthy();
    expect(screen.getByText('certificate.pdf')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: 'Upload Qualification' }),
    );

    expect(mockedActions.uploadQualificationDocumentAction).toHaveBeenCalledTimes(1);
    expect(mockedActions.uploadQualificationDocumentAction).toHaveBeenCalledWith(
      expect.any(FormData),
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
    );
  });

  it('shows local validation feedback for unsupported qualification document types', () => {
    renderView();

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    const fileInput = screen.getByLabelText('Select qualification document');
    const file = new File(['qualification'], 'certificate.txt', {
      type: 'text/plain',
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(
      screen.getByText('Only PDF, JPG, and PNG qualification documents are allowed.'),
    ).toBeTruthy();
    expect(
      mockedActions.uploadQualificationDocumentAction,
    ).not.toHaveBeenCalled();
  });

  it('renders uploaded files with active and status badges', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [
          buildQualificationDocument(),
          buildQualificationDocument({
            _id: 'doc-2',
            originalFileName: 'older-certificate.png',
            status: 'approved',
            isActive: false,
            createdAt: '2026-02-14T12:00:00.000Z',
          }),
        ],
        activeDocumentId: 'doc-1',
        profileStatus: 'pending',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    const uploadedFilesSection = screen.getByText('Uploaded Files').closest('div');

    expect(uploadedFilesSection).toBeTruthy();
    expect(
      within(uploadedFilesSection).getByText('pt-certificate.pdf'),
    ).toBeTruthy();
    expect(
      within(uploadedFilesSection).getByText('older-certificate.png'),
    ).toBeTruthy();
    expect(
      within(uploadedFilesSection).getByText('Active Submission'),
    ).toBeTruthy();
    expect(within(uploadedFilesSection).getByText('Superseded')).toBeTruthy();
    expect(
      within(uploadedFilesSection).getByText('Pending Review'),
    ).toBeTruthy();
    expect(within(uploadedFilesSection).getByText('Approved')).toBeTruthy();
  });

  it('replaces the active uploaded qualification document', () => {
    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [buildQualificationDocument()],
        activeDocumentId: 'doc-1',
        profileStatus: 'pending',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Replace' }));

    const fileInput = screen.getByLabelText('Replace qualification document');
    const file = new File(['replacement'], 'replacement.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(mockedActions.replaceQualificationDocumentAction).toHaveBeenCalledTimes(1);
    expect(mockedActions.replaceQualificationDocumentAction).toHaveBeenCalledWith(
      'doc-1',
      expect.any(FormData),
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
    );
  });

  it('deletes an uploaded qualification document after confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderView({
      qualificationDocuments: {
        loading: false,
        error: null,
        documents: [buildQualificationDocument()],
        activeDocumentId: 'doc-1',
        profileStatus: 'pending',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Qualifications & Documents' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete pt-certificate.pdf?',
    );
    expect(mockedActions.deleteQualificationDocumentAction).toHaveBeenCalledTimes(1);
    expect(mockedActions.deleteQualificationDocumentAction).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
    );

    confirmSpy.mockRestore();
  });

  it('shows upload success notification and resets upload state', async () => {
    const { store } = renderView({
      qualificationDocumentUpload: {
        loading: false,
        success: true,
        error: null,
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText('Qualification document uploaded successfully'),
      ).toBeTruthy();
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'QUALIFICATION_DOCUMENT_UPLOAD_RESET',
    });
  });

  it('shows replace error notification and resets replace state', async () => {
    const { store } = renderView({
      qualificationDocumentReplace: {
        loading: false,
        success: false,
        error: 'Replacement failed',
        message: null,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Replacement failed')).toBeTruthy();
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'QUALIFICATION_DOCUMENT_REPLACE_RESET',
    });
  });

  it('shows delete success notification and resets delete state', async () => {
    const { store } = renderView({
      qualificationDocumentDelete: {
        loading: false,
        success: true,
        error: null,
        message: 'Qualification document removed',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Qualification document removed')).toBeTruthy();
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'QUALIFICATION_DOCUMENT_DELETE_RESET',
    });
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
