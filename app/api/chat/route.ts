import { NextResponse } from "next/server";

import type { createClient } from "@/lib/supabase/server";
import {
	HttpError,
	decrementUserCredits,
	getAuthenticatedUser,
	getUserCredits,
} from "@/lib/credits";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const HISTORY_LIMIT = 20;

const SYSTEM_PROMPT =
	"You are Meridian, a focused AI workspace. Give clear, accurate, and helpful answers. Use Markdown when it improves readability, including fenced code blocks for code.";

async function loadRecentHistory(
	supabase: SupabaseClient,
	userId: string,
): Promise<ChatMessage[]> {
	const { data, error } = await supabase
		.from("messages")
		.select("role, content")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(HISTORY_LIMIT);

	if (error) {
		console.error("[chat] history query failed:", describe(error));
		throw error;
	}

	return (Array.isArray(data) ? data : [])
		.filter(
			(row) => row && (row.role === "user" || row.role === "assistant"),
		)
		.reverse()
		.map(({ role, content }) => ({
			role: role as ChatMessage["role"],
			content: String(content ?? "").trim(),
		}))
		.filter((entry) => entry.content.length > 0);
}

function describe(error: unknown): string {
	if (error instanceof Error) {
		const parts = [`${error.name}: ${error.message}`];
		if (error.stack) {
			parts.push(`stack=${error.stack.split("\n").slice(0, 5).join(" | ")}`);
		}
		const err = error as Error & { status?: number };
		if (typeof err.status === "number") {
			parts.push(`status=${err.status}`);
		}
		const cause =
			error.cause instanceof Error ? `${error.cause.name}: ${error.cause.message}` : null;
		if (cause) {
			parts.push(`cause=${cause}`);
		}
		return parts.join("; ");
	}

	try {
		const serialized = JSON.stringify(error);
		return `non-Error thrown: ${serialized === undefined ? String(error) : serialized}`;
	} catch {
		return `non-Error thrown: ${String(error)}`;
	}
}

function respond(status: number, body: Record<string, unknown>) {
	console.log(
		`[chat] final response: HTTP ${status}`,
		JSON.stringify(body)?.slice(0, 1000),
	);
	return NextResponse.json(body, { status });
}

async function callGroq(messages: ChatMessage[], apiKey: string) {
	const invoke = () =>
		fetch(GROQ_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: GROQ_MODEL,
				messages,
				temperature: 0.7,
				max_tokens: 8192,
			}),
			signal: AbortSignal.timeout(60_000),
		});

	let response: Response;

	try {
		response = await invoke();
	} catch (error) {
		// Transient network/timeout failure — retry once before giving up.
		console.error(
			"[chat] Groq request errored, retrying:",
			error instanceof Error ? error.message : String(error),
		);
		await new Promise((resolve) => setTimeout(resolve, 750));
		response = await invoke();
	}

	// Retry once on transient provider errors (429 rate-limit or 5xx).
	if (response.status >= 429) {
		await new Promise((resolve) => setTimeout(resolve, 750));
		response = await invoke();
	}

	return response;
}

export async function POST(request: Request) {
	try {
		console.log("[chat] > API route /api/chat called (POST)");

		const { supabase, user } = await getAuthenticatedUser();

		console.log("[chat]   authenticated user:", user.id.slice(0, 8) + "...");

		const body = await request.json();

		const message =
			typeof body?.message === "string" ? body.message.trim() : "";

		console.log(
			"[chat]   incoming user message:",
			message.length > 200 ? `${message.slice(0, 200)}… (${message.length} chars)` : message,
		);

		if (!message) {
			return respond(400, { error: "Message is required." });
		}

		const currentCredits = await getUserCredits(supabase, user.id);

		console.log("[chat]   credits available:", currentCredits);

		if (currentCredits <= 0) {
			return respond(402, {
				error: "You have no credits remaining.",
			});
		}

		const apiKey = process.env.GROQ_API_KEY;

		console.log("[chat]   GROQ_API_KEY loaded:", Boolean(apiKey));

		if (!apiKey) {
			return respond(500, {
				error: "Groq API key is not configured.",
			});
		}

		const history = await loadRecentHistory(supabase, user.id);

		console.log("[chat]   history messages loaded:", history.length);

		const messages: ChatMessage[] = [
			{ role: "system", content: SYSTEM_PROMPT },
			...history,
			{ role: "user", content: message },
		];

		// Call Groq
		console.log("[chat]   calling Groq -> model:", GROQ_MODEL);

		const response = await callGroq(messages, apiKey);

		if (!response.ok) {
			const errorText = await response.text();
			let providerError = errorText;

			try {
				const parsed = JSON.parse(errorText) as {
					error?: { message?: string };
				};
				if (parsed?.error?.message) {
					providerError = parsed.error.message;
				}
			} catch {
				// Keep the raw body for logging.
			}

			console.error(
				"[chat]   Groq request FAILED: HTTP",
				response.status,
				"| body:",
				providerError.slice(0, 2000),
			);

			return respond(500, {
				error: "The Groq request failed.",
				...(process.env.NODE_ENV !== "production"
					? {
							detail: `Groq HTTP ${response.status}: ${providerError}`,
						}
					: {}),
			});
		}

		console.log("[chat]   Groq response status:", response.status);

		const data = (await response.json()) as {
			choices?: Array<{
				message?: {
					content?: string;
				};
			}>;
		};

		const reply =
			data.choices?.[0]?.message?.content?.trim() ?? "No response returned.";

		console.log("[chat] Groq reply length:", reply.length);

		// Deduct credit only after the provider succeeds
		const decrementResult = await decrementUserCredits(supabase, user.id);

		console.log("[chat]   credit deduction:", JSON.stringify(decrementResult));

		if (!decrementResult.success) {
			return respond(402, {
				error: "Not enough credits available.",
				creditsLeft: decrementResult.credits_left,
			});
		}

		// Save user message
		const userInsert = await supabase.from("messages").insert({
			user_id: user.id,
			role: "user",
			content: message,
		});

		if (userInsert.error) {
			console.error(
				"[chat]   FAILED to persist user message:",
				JSON.stringify(userInsert.error),
			);
			throw userInsert.error;
		}

		// Save assistant message
		const assistantInsert = await supabase.from("messages").insert({
			user_id: user.id,
			role: "assistant",
			content: reply,
		});

		if (assistantInsert.error) {
			console.error(
				"[chat]   FAILED to persist assistant message:",
				JSON.stringify(assistantInsert.error),
			);
			throw assistantInsert.error;
		}

		return respond(200, {
			reply,
			creditsLeft: decrementResult.credits_left,
		});
	} catch (error) {
		if (error instanceof HttpError) {
			return respond(error.status, {
				error: error.message,
			});
		}

		console.error("Chat API error:", describe(error));

		const err = error instanceof Error ? error : null;

		const detail =
			process.env.NODE_ENV !== "production"
				? err
					? `${err.name}: ${err.message}${
							typeof (err as Error & { status?: number }).status ===
							"number"
								? ` (HTTP ${(err as Error & { status?: number }).status})`
								: ""
						}`
					: `non-Error thrown: ${String(error)}`
				: undefined;

		return respond(500, {
			error: "An unexpected error occurred while processing your request.",
			...(detail ? { detail } : {}),
		});
	}
}