import api from "./api";

export const createCaseNote = async (caseId: string, noteData: { title: string; content: string; tags: string[] }) => {
  try {
    const response = await api.post(`/api/v1/cases/${caseId}/notes`, noteData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create case note",
    };
  }
};