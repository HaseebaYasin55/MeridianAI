import { createClient } from "@/lib/supabase/server";

export class HttpError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "HttpError";
		this.status = status;
	}
}

export type CreditDecrementResult = {
	success: boolean;
	credits_left: number;
};

export async function getAuthenticatedUser() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new HttpError("Unauthorized", 401);
	}

	return { supabase, user };
}

export async function getUserCredits(
	supabase: Awaited<ReturnType<typeof createClient>>,
	userId: string,
) {
	const { data, error } = await supabase.rpc("get_credits", {
		p_user_id: userId,
	});

	if (error) {
		throw error;
	}

	const first = Array.isArray(data) ? data[0] : data;

	return Number(first?.credits_count ?? 0);
}

export async function decrementUserCredits(
	supabase: Awaited<ReturnType<typeof createClient>>,
	userId: string,
): Promise<CreditDecrementResult> {
	const { data, error } = await supabase.rpc("deduct_credit", {
		p_user_id: userId,
	});

	if (error) {
		throw error;
	}

	const first = Array.isArray(data) ? data[0] : data;

	return {
		success: Boolean(first?.success),
		credits_left: Number(first?.credits_left ?? 0),
	};
}
