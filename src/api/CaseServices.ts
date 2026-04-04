import api from "./api";
import { CreateCasePayload, GetCasesParams } from "./interface";

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
        page: params.page || 1,
        limit: params.limit || 10,
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