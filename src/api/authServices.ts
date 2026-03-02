import api from "./api";


interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post("/api/v1/auth/register", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post("/api/v1/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

interface ForgotPasswordData {
  email: string;
}

export const forgotPassword = async (data: ForgotPasswordData) => {
  try {
    const response = await api.post("/api/v1/auth/forgot-password", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (data: { token: string; password: string }) => {
  try {
    const response = await api.post("/api/v1/auth/reset-password", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || error.message;
  }
};
