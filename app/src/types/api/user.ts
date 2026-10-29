export type UserRole = "admin" | "staff";

export type UserApi = {
	id: number;
	account_code?: string;
	username: string;
	role: UserRole;
	is_active: boolean;
	avatar_url?: string | null;
	created_at: string;
};

export type CreateUserPayload = {
	username: string;
	password: string;
	role: UserRole;
};

export type UpdateUserPayload = {
	is_active?: boolean;
	role?: UserRole;
	password?: string;
};
