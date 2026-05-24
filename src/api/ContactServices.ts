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

export const createContact = async (payload: any) => {
  try {
    const response = await api.post("/api/v1/contacts", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      error: true,
      message: "Failed to create contact",
    };
  }
};