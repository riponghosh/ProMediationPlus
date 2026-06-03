import api from "./api";
import { SessionPayload } from "./interface";

export const createSession = async (payload: SessionPayload) => {
  try {
    const response = await api.post("/api/v1/sessions", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create session",
    };
  }
};