import {
  QUALIFICATION_DOCUMENT_ADMIN_LIST_FAILURE,
  QUALIFICATION_DOCUMENT_ADMIN_LIST_REQUEST,
  QUALIFICATION_DOCUMENT_ADMIN_LIST_RESET,
  QUALIFICATION_DOCUMENT_ADMIN_LIST_SUCCESS,
  QUALIFICATION_DOCUMENT_DELETE_FAILURE,
  QUALIFICATION_DOCUMENT_DELETE_REQUEST,
  QUALIFICATION_DOCUMENT_DELETE_RESET,
  QUALIFICATION_DOCUMENT_DELETE_SUCCESS,
  QUALIFICATION_DOCUMENT_LIST_FAILURE,
  QUALIFICATION_DOCUMENT_LIST_REQUEST,
  QUALIFICATION_DOCUMENT_LIST_RESET,
  QUALIFICATION_DOCUMENT_LIST_SUCCESS,
  QUALIFICATION_DOCUMENT_REPLACE_FAILURE,
  QUALIFICATION_DOCUMENT_REPLACE_REQUEST,
  QUALIFICATION_DOCUMENT_REPLACE_RESET,
  QUALIFICATION_DOCUMENT_REPLACE_SUCCESS,
  QUALIFICATION_DOCUMENT_REVIEW_FAILURE,
  QUALIFICATION_DOCUMENT_REVIEW_REQUEST,
  QUALIFICATION_DOCUMENT_REVIEW_RESET,
  QUALIFICATION_DOCUMENT_REVIEW_SUCCESS,
  QUALIFICATION_DOCUMENT_UPLOAD_FAILURE,
  QUALIFICATION_DOCUMENT_UPLOAD_REQUEST,
  QUALIFICATION_DOCUMENT_UPLOAD_RESET,
  QUALIFICATION_DOCUMENT_UPLOAD_SUCCESS,
} from '../constants/qualificationDocumentConstants';

const qualificationDocumentListInitialState = {
  documents: [],
  page: 1,
  pages: 1,
  total: 0,
  activeDocumentId: null,
  profileStatus: 'none',
};

const qualificationDocumentAdminListInitialState = {
  documents: [],
  page: 1,
  pages: 1,
  total: 0,
};

export const qualificationDocumentListReducer = (
  state = qualificationDocumentListInitialState,
  action,
) => {
  switch (action.type) {
    case QUALIFICATION_DOCUMENT_LIST_REQUEST:
      return { ...state, loading: true };
    case QUALIFICATION_DOCUMENT_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        documents: action.payload.documents,
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
        activeDocumentId: action.payload.activeDocumentId,
        profileStatus: action.payload.profileStatus,
      };
    case QUALIFICATION_DOCUMENT_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case QUALIFICATION_DOCUMENT_LIST_RESET:
      return qualificationDocumentListInitialState;
    default:
      return { ...state };
  }
};

export const qualificationDocumentUploadReducer = (state = {}, action) => {
  switch (action.type) {
    case QUALIFICATION_DOCUMENT_UPLOAD_REQUEST:
      return { ...state, loading: true };
    case QUALIFICATION_DOCUMENT_UPLOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
        document: action.payload.document,
        profileStatus: action.payload.profileStatus,
      };
    case QUALIFICATION_DOCUMENT_UPLOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case QUALIFICATION_DOCUMENT_UPLOAD_RESET:
      return {};
    default:
      return { ...state };
  }
};

export const qualificationDocumentReplaceReducer = (state = {}, action) => {
  switch (action.type) {
    case QUALIFICATION_DOCUMENT_REPLACE_REQUEST:
      return { ...state, loading: true };
    case QUALIFICATION_DOCUMENT_REPLACE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
        replacedDocumentId: action.payload.replacedDocumentId,
        document: action.payload.document,
        profileStatus: action.payload.profileStatus,
      };
    case QUALIFICATION_DOCUMENT_REPLACE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case QUALIFICATION_DOCUMENT_REPLACE_RESET:
      return {};
    default:
      return { ...state };
  }
};

export const qualificationDocumentDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case QUALIFICATION_DOCUMENT_DELETE_REQUEST:
      return { ...state, loading: true };
    case QUALIFICATION_DOCUMENT_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
        deletedDocumentId: action.payload.deletedDocumentId,
        profileStatus: action.payload.profileStatus,
      };
    case QUALIFICATION_DOCUMENT_DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case QUALIFICATION_DOCUMENT_DELETE_RESET:
      return {};
    default:
      return { ...state };
  }
};

export const qualificationDocumentAdminListReducer = (
  state = qualificationDocumentAdminListInitialState,
  action,
) => {
  switch (action.type) {
    case QUALIFICATION_DOCUMENT_ADMIN_LIST_REQUEST:
      return { ...state, loading: true };
    case QUALIFICATION_DOCUMENT_ADMIN_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        documents: action.payload.documents,
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
      };
    case QUALIFICATION_DOCUMENT_ADMIN_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case QUALIFICATION_DOCUMENT_ADMIN_LIST_RESET:
      return qualificationDocumentAdminListInitialState;
    default:
      return { ...state };
  }
};

export const qualificationDocumentReviewReducer = (state = {}, action) => {
  switch (action.type) {
    case QUALIFICATION_DOCUMENT_REVIEW_REQUEST:
      return { ...state, loading: true };
    case QUALIFICATION_DOCUMENT_REVIEW_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
        document: action.payload.document,
        profileStatus: action.payload.profileStatus,
      };
    case QUALIFICATION_DOCUMENT_REVIEW_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case QUALIFICATION_DOCUMENT_REVIEW_RESET:
      return {};
    default:
      return { ...state };
  }
};
