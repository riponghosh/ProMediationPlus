import api from "./api";
import { CreateInvitationData, CreateRoleData, InvitationsResponse, PermissionsResponse, RolesResponse, SingleUserResponse, UpdateRoleData, UsersResponse } from "./interface";


export const getAllUsers = async (): Promise<UsersResponse> => {
  try {
    const response = await api.get("/api/v1/admin/users"); 
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getSingleUser = async (userId: string): Promise<SingleUserResponse> => {
  try {
    const response = await api.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateUserProfile = async (userId: string, data: { fullName: string, roleId: number }) => {
  const response = await api.patch(`/api/v1/admin/users/${userId}`, data);
  return response.data;
};

// Get all roles
export const getAllRoles = async (): Promise<RolesResponse> => {
  try {
    const response = await api.get("/api/v1/admin/roles"); 
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getAllInvitations = async (): Promise<InvitationsResponse> => {
  try {
    const response = await api.get("/api/v1/admin/invitations");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const createInvitation = async (data: CreateInvitationData) => {
  try {
    const response = await api.post("/api/v1/admin/invitations", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const resendInvitation = async (invitationId: string) => {
  try {
    const response = await api.post(`/api/v1/admin/invitations/${invitationId}/resend`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const revokeInvitation = async (invitationId: string) => {
  try {
    const response = await api.delete(`/api/v1/admin/invitations/${invitationId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const createNewRole = async (data: CreateRoleData) => {
  try {
    const response = await api.post("/api/v1/admin/roles", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getAllPermissions = async (): Promise<PermissionsResponse> => {
  try {
    const response = await api.get("/api/v1/admin/permissions");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateRole = async (roleId: number, data: UpdateRoleData) => {
  try {
    const response = await api.put(`/api/v1/admin/roles/${roleId}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

