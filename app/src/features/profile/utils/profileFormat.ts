export function getDisplayName(username: string) {
	return username
		.replace(/[._-]/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getInitials(username: string) {
	const parts = username.replace(/[._-]/g, " ").trim().split(/\s+/);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}
	return username.slice(0, 2).toUpperCase();
}
