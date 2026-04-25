import api from "./api";
import { CaseMeetingData } from "./interface";

export const createCaseMeeting = async (caseId: string, meetingData: CaseMeetingData) => {
  try {
    const response = await api.post(`/api/v1/cases/${caseId}/meetings`, meetingData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create meeting",
    };
  }
};

export const getCaseMeetings = async (caseId: string) => {
  try {
    const response = await api.get(`/api/v1/cases/${caseId}/meetings`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch meetings",
    };
  }
};