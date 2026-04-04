export interface Role {
  id: number;
  name: string;
}

export interface UserData {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  status: string;
  isActive: boolean;
  isVerified: boolean;
  lastActive: string;
  role: Role;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
  };
  data: UserData[];
}

export interface Permission {
  id: number;
  slug: string;
  name: string;
  RolePermission: {
    roleId: number;
    permissionId: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RoleData {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  permissions: Permission[];
}

export interface RolesResponse {
  success: boolean;
  message: string;
  meta: { timestamp: string };
  data: RoleData[];
}
export interface InvitationData {
  id: string;
  email: string;
  roleId: number;
  invitedBy: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  role: {
    name: string;
  };
  inviter: {
    fullName: string;
    email: string;
  };
}

export interface InvitationsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
  };
  data: InvitationData[];
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  meta: { timestamp: string };
  data: any;
}

export interface CreateInvitationData {
  email: string;
  roleId: number;
}

export interface CreatePermissionPayload {
  name: string;
  slug: string;
  group: string;
}

export interface CreatePermissionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    slug: string;
    group: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface PermissionData {
  id: number;
  name: string;
  slug: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
  };
  data: PermissionData[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

export interface CreateCasePayload {
  title: string;
  caseFileNumber: string;
  type: string;
  clientName: string;
  description?: string;
  parties: string[];
  email: string;
  phone: string;
  address: string;
  intakeForm?: Record<string, any>;
  caseFileName: string;
}

export interface GetCasesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}