import api from "./api";
import { CreateCasePayload, GetCasesParams, UpdateCasePayload } from "./interface";

export const createCase = async (data: CreateCasePayload) => {
  try {
    const response = await api.post("/api/v1/cases", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create case",
    };
  }
};

export const getCases = async (params: GetCasesParams) => {
  try {
    const response = await api.get("/api/v1/cases", {
      params: {
        page: params.page ,
        limit: params.limit,
        status: params.status || "",
        search: params.search || "",
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch cases",
    };
  }
};

export const getCaseById = async (caseId: string) => {
  try {
    const response = await api.get(`/api/v1/cases/${caseId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch case details",
    };
  }
};

export const updateCase = async (caseId: string, payload: UpdateCasePayload) => {
  try {
    const response = await api.put(`/api/v1/cases/${caseId}`, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to update case",
    };
  }
};

export const deleteCase = async (caseId: string) => {
  try {
    const response = await api.delete(`/api/v1/cases/${caseId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to delete case",
    };
  }
};
