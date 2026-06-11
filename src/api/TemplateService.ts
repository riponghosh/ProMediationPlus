import api from "./api";

export const createTemplate = async (payload: any) => {
  try {
    const response = await api.post("/api/v1/templates", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create template",
    };
  }
};

export const getTemplates = async () => {
  try {
    const response = await api.get("/api/v1/templates");
    return response.data;
  }
  catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch templates",
    };
  }
};

export const getTemplateById = async (id: string) => {
  try {
    const response = await api.get(`/api/v1/templates/${id}`);
    return response.data;
  }
  catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch template",
    };
  }
};

export const deleteTemplate = async (id: string) => {
  try {
    const response = await api.delete(`/api/v1/templates/${id}`);
    return response.data;
  }
  catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to delete template",
    };
  }
};