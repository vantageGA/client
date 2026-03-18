import { describe, expect, it } from 'vitest';
import {
  qualificationDocumentAdminListReducer,
  qualificationDocumentDeleteReducer,
  qualificationDocumentListReducer,
  qualificationDocumentReviewReducer,
  qualificationDocumentUploadReducer,
} from './qualificationDocumentReducers';
import {
  QUALIFICATION_DOCUMENT_ADMIN_LIST_RESET,
  QUALIFICATION_DOCUMENT_ADMIN_LIST_SUCCESS,
  QUALIFICATION_DOCUMENT_DELETE_SUCCESS,
  QUALIFICATION_DOCUMENT_LIST_SUCCESS,
  QUALIFICATION_DOCUMENT_REVIEW_FAILURE,
  QUALIFICATION_DOCUMENT_UPLOAD_SUCCESS,
} from '../constants/qualificationDocumentConstants';

describe('qualificationDocumentListReducer', () => {
  it('stores paginated document results and profile summary state', () => {
    const payload = {
      documents: [{ _id: 'doc-1', status: 'pending' }],
      page: 2,
      pages: 4,
      total: 7,
      activeDocumentId: 'doc-1',
      profileStatus: 'pending',
    };

    const state = qualificationDocumentListReducer(undefined, {
      type: QUALIFICATION_DOCUMENT_LIST_SUCCESS,
      payload,
    });

    expect(state.documents).toEqual(payload.documents);
    expect(state.page).toBe(2);
    expect(state.pages).toBe(4);
    expect(state.total).toBe(7);
    expect(state.activeDocumentId).toBe('doc-1');
    expect(state.profileStatus).toBe('pending');
  });
});

describe('qualificationDocumentUploadReducer', () => {
  it('stores upload response details on success', () => {
    const payload = {
      message: 'Qualification document uploaded successfully',
      document: { _id: 'doc-2', status: 'pending' },
      profileStatus: 'pending',
    };

    const state = qualificationDocumentUploadReducer(undefined, {
      type: QUALIFICATION_DOCUMENT_UPLOAD_SUCCESS,
      payload,
    });

    expect(state.success).toBe(true);
    expect(state.message).toBe(payload.message);
    expect(state.document).toEqual(payload.document);
    expect(state.profileStatus).toBe('pending');
  });
});

describe('qualificationDocumentDeleteReducer', () => {
  it('stores deleted document state on success', () => {
    const payload = {
      message: 'Qualification document deleted successfully',
      deletedDocumentId: 'doc-3',
      profileStatus: 'none',
    };

    const state = qualificationDocumentDeleteReducer(undefined, {
      type: QUALIFICATION_DOCUMENT_DELETE_SUCCESS,
      payload,
    });

    expect(state.success).toBe(true);
    expect(state.deletedDocumentId).toBe('doc-3');
    expect(state.profileStatus).toBe('none');
  });
});

describe('qualificationDocumentAdminListReducer', () => {
  it('resets to its initial paginated admin state', () => {
    const populatedState = qualificationDocumentAdminListReducer(undefined, {
      type: QUALIFICATION_DOCUMENT_ADMIN_LIST_SUCCESS,
      payload: {
        documents: [{ _id: 'doc-4', status: 'approved' }],
        page: 3,
        pages: 5,
        total: 12,
      },
    });

    const state = qualificationDocumentAdminListReducer(populatedState, {
      type: QUALIFICATION_DOCUMENT_ADMIN_LIST_RESET,
    });

    expect(state).toEqual({
      documents: [],
      page: 1,
      pages: 1,
      total: 0,
    });
  });
});

describe('qualificationDocumentReviewReducer', () => {
  it('stores review failure state', () => {
    const state = qualificationDocumentReviewReducer(undefined, {
      type: QUALIFICATION_DOCUMENT_REVIEW_FAILURE,
      payload: 'Only active qualification documents can be reviewed',
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBe(
      'Only active qualification documents can be reviewed',
    );
  });
});
