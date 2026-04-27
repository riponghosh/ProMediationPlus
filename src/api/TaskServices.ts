import api from "./api";
import { CaseTaskData } from "./interface";

export const createCaseTask = async (caseId: string, taskData: CaseTaskData) => {
  try {
    const response = await api.post(`/api/v1/cases/${caseId}/tasks`, taskData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create case task",
    };
  }
};

export const getCaseTasks = async (caseId: string) => {
  try {
    const response = await api.get(`/api/v1/cases/${caseId}/tasks`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch tasks",
    };
  }
};