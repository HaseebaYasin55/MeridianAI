import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatInterface } from "@/app/chatbot/chat-interface";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Workspace",
};

export const dynamic = "force-dynamic";

export default async function ChatbotPage() {
	const supabase = await createClient();
	const { data: userData } = await supabase.auth.getUser();
	const user = userData.user;

	if (!user) {
		redirect("/auth/login");
	}

	const { data: creditsData } = await supabase.rpc("get_credits", {
		p_user_id: user.id,
	});

	const creditRow = Array.isArray(creditsData) ? creditsData[0] : creditsData;
	const initialCredits = Number(creditRow?.credits_count ?? 0);

	const { data: messagesData } = await supabase
		.from("messages")
		.select("id, role, content, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: true });

	return (
		<ChatInterface
			initialCredits={initialCredits}
			initialMessages={messagesData ?? []}
			userEmail={user.email ?? ""}
		/>
	);
}