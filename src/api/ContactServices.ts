import api from "./api";

export const getContacts = async () => {
  try {
    const response = await api.get("/api/v1/contacts");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to fetch contacts",
    };
  }
};