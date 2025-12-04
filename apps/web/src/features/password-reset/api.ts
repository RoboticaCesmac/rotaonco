import { apiBaseUrl } from "@/lib/api-client";

async function parseError(response: Response) {
	try {
		const data = await response.json();
		if (typeof data?.message === "string" && data.message.trim().length > 0) {
			return data.message.trim();
		}
	} catch {
		// ignore JSON parse errors
	}
	return `Erro ${response.status}`;
}

async function request(path: string, init: RequestInit = {}) {
	const response = await fetch(`${apiBaseUrl}${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(init.headers ?? {}),
		},
	});

	if (!response.ok) {
		throw new Error(await parseError(response));
	}

	return response;
}

export async function requestPasswordReset(email: string) {
	await request("/auth/password-reset", {
		method: "POST",
		body: JSON.stringify({ email }),
	});
}

export async function validatePasswordResetToken(token: string) {
	await request(`/auth/password-reset/validate?token=${encodeURIComponent(token)}`, {
		method: "GET",
	});
}

export async function confirmPasswordReset(input: {
	token: string;
	newPassword: string;
	confirmPassword: string;
}) {
	await request("/auth/password-reset/confirm", {
		method: "POST",
		body: JSON.stringify(input),
	});
}
