import axios from 'axios';
import {
  QUALIFICATION_DOCUMENT_ADMIN_LIST_FAILURE,
  QUALIFICATION_DOCUMENT_ADMIN_LIST_REQUEST,
  QUALIFICATION_DOCUMENT_ADMIN_LIST_SUCCESS,
  QUALIFICATION_DOCUMENT_DELETE_FAILURE,
  QUALIFICATION_DOCUMENT_DELETE_REQUEST,
  QUALIFICATION_DOCUMENT_DELETE_SUCCESS,
  QUALIFICATION_DOCUMENT_LIST_FAILURE,
  QUALIFICATION_DOCUMENT_LIST_REQUEST,
  QUALIFICATION_DOCUMENT_LIST_SUCCESS,
  QUALIFICATION_DOCUMENT_REPLACE_FAILURE,
  QUALIFICATION_DOCUMENT_REPLACE_REQUEST,
  QUALIFICATION_DOCUMENT_REPLACE_SUCCESS,
  QUALIFICATION_DOCUMENT_REVIEW_FAILURE,
  QUALIFICATION_DOCUMENT_REVIEW_REQUEST,
  QUALIFICATION_DOCUMENT_REVIEW_SUCCESS,
  QUALIFICATION_DOCUMENT_UPLOAD_FAILURE,
  QUALIFICATION_DOCUMENT_UPLOAD_REQUEST,
  QUALIFICATION_DOCUMENT_UPLOAD_SUCCESS,
} from '../constants/qualificationDocumentConstants';
import {
  profileOfLoggedInUserAction,
  profilesAdminAction,
} from './profileActions';

const getErrorMessage = (error) =>
  error.response && error.response.data.message
    ? error.response.data.message
    : error.message;

const buildQualificationDocumentQueryParams = (
  page = 1,
  limit = 20,
  filters = {},
) => {
  const params = new URLSearchParams({ page, limit });

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.isActive !== undefined) {
    params.set('isActive', String(filters.isActive));
  }

  return params;
};

export const qualificationDocumentsAction =
  (page = 1, limit = 20, filters = {}) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: QUALIFICATION_DOCUMENT_LIST_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const params = buildQualificationDocumentQueryParams(page, limit, filters);
      const { data } = await axios.get(
        `/api/profile/qualification-documents?${params}`,
        config,
      );

      dispatch({
        type: QUALIFICATION_DOCUMENT_LIST_SUCCESS,
        payload: {
          documents: data.documents,
          page: data.page,
          pages: data.pages,
          total: data.total,
          activeDocumentId: data.activeDocumentId,
          profileStatus: data.profileStatus,
        },
      });
    } catch (error) {
      dispatch({
        type: QUALIFICATION_DOCUMENT_LIST_FAILURE,
        payload: getErrorMessage(error),
      });
    }
  };

export const uploadQualificationDocumentAction =
  (documentFormData, refreshListOptions = null) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: QUALIFICATION_DOCUMENT_UPLOAD_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        '/api/profile/qualification-documents',
        documentFormData,
        config,
      );

      dispatch({
        type: QUALIFICATION_DOCUMENT_UPLOAD_SUCCESS,
        payload: data,
      });

      dispatch(profileOfLoggedInUserAction());

      if (refreshListOptions) {
        dispatch(
          qualificationDocumentsAction(
            refreshListOptions.page,
            refreshListOptions.limit,
            refreshListOptions.filters,
          ),
        );
      }
    } catch (error) {
      dispatch({
        type: QUALIFICATION_DOCUMENT_UPLOAD_FAILURE,
        payload: getErrorMessage(error),
      });
    }
  };

export const replaceQualificationDocumentAction =
  (id, documentFormData, refreshListOptions = null) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: QUALIFICATION_DOCUMENT_REPLACE_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/profile/qualification-documents/${id}`,
        documentFormData,
        config,
      );

      dispatch({
        type: QUALIFICATION_DOCUMENT_REPLACE_SUCCESS,
        payload: data,
      });

      dispatch(profileOfLoggedInUserAction());

      if (refreshListOptions) {
        dispatch(
          qualificationDocumentsAction(
            refreshListOptions.page,
            refreshListOptions.limit,
            refreshListOptions.filters,
          ),
        );
      }
    } catch (error) {
      dispatch({
        type: QUALIFICATION_DOCUMENT_REPLACE_FAILURE,
        payload: getErrorMessage(error),
      });
    }
  };

export const deleteQualificationDocumentAction =
  (id, refreshListOptions = null) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: QUALIFICATION_DOCUMENT_DELETE_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.delete(
        `/api/profile/qualification-documents/${id}`,
        config,
      );

      dispatch({
        type: QUALIFICATION_DOCUMENT_DELETE_SUCCESS,
        payload: data,
      });

      dispatch(profileOfLoggedInUserAction());

      if (refreshListOptions) {
        dispatch(
          qualificationDocumentsAction(
            refreshListOptions.page,
            refreshListOptions.limit,
            refreshListOptions.filters,
          ),
        );
      }
    } catch (error) {
      dispatch({
        type: QUALIFICATION_DOCUMENT_DELETE_FAILURE,
        payload: getErrorMessage(error),
      });
    }
  };

export const qualificationDocumentsAdminAction =
  (page = 1, limit = 20, filters = {}) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: QUALIFICATION_DOCUMENT_ADMIN_LIST_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const params = buildQualificationDocumentQueryParams(page, limit, filters);
      const { data } = await axios.get(
        `/api/profiles/admin/qualification-documents?${params}`,
        config,
      );

      dispatch({
        type: QUALIFICATION_DOCUMENT_ADMIN_LIST_SUCCESS,
        payload: {
          documents: data.documents,
          page: data.page,
          pages: data.pages,
          total: data.total,
        },
      });
    } catch (error) {
      dispatch({
        type: QUALIFICATION_DOCUMENT_ADMIN_LIST_FAILURE,
        payload: getErrorMessage(error),
      });
    }
  };

export const reviewQualificationDocumentAction =
  (
    id,
    reviewData,
    refreshListOptions = null,
    refreshProfileOptions = null,
  ) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: QUALIFICATION_DOCUMENT_REVIEW_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.patch(
        `/api/profiles/admin/qualification-documents/${id}/review`,
        reviewData,
        config,
      );

      dispatch({
        type: QUALIFICATION_DOCUMENT_REVIEW_SUCCESS,
        payload: data,
      });

      dispatch(
        profilesAdminAction(
          refreshProfileOptions?.page || 1,
          refreshProfileOptions?.limit || 50,
        ),
      );

      if (refreshListOptions) {
        dispatch(
          qualificationDocumentsAdminAction(
            refreshListOptions.page,
            refreshListOptions.limit,
            refreshListOptions.filters,
          ),
        );
      }
    } catch (error) {
      dispatch({
        type: QUALIFICATION_DOCUMENT_REVIEW_FAILURE,
        payload: getErrorMessage(error),
      });
    }
  };
