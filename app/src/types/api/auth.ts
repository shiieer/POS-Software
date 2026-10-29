export type LoginRequest = {
	username: string;
	password: string;
};

export type TokenResponse = {
	access_token: string;
	token_type: string;
	role: "admin" | "staff";
	username: string;
	account_code?: string;
};
