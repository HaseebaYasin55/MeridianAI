import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ArrowUp, CircleDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/datetime";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Dashboard",
};

export const dynamic = "force-dynamic";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	created_at: string;
};

function relativeReset(resetAt: string | null | undefined): string {
	if (!resetAt) return "";
	const target = new Date(resetAt).getTime();
	if (Number.isNaN(target) || target <= Date.now()) return "";
	const minutes = Math.round((target - Date.now()) / 60000);
	if (minutes < 60) return `refills in about ${minutes} min`;
	return `refills in about ${Math.round(minutes / 60)} h`;
}

export default async function ProtectedPage() {
	const supabase = await createClient();
	const { data: userData } = await supabase.auth.getUser();
	const user = userData.user;

	if (!user) {
		redirect("/auth/login");
	}

	const email = user.email ?? "";
	const firstName = email.split("@")[0] || "friend";

	const { data: creditsData } = await supabase.rpc("get_credits", {
		p_user_id: user.id,
	});
	const creditRow = Array.isArray(creditsData) ? creditsData[0] : creditsData;
	const credits = Number(creditRow?.credits_count ?? 0);
	const resetAt =
		typeof creditRow?.reset_at === "string" ? creditRow.reset_at : null;

	const { data: recentMessages } = await supabase
		.from("messages")
		.select("id, role, content, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(6);

	const messages: Message[] = (recentMessages ?? []).map((m) => ({
		id: m.id,
		role: m.role as "user" | "assistant",
		content: m.content,
		created_at: m.created_at,
	}));

	const resetNote = relativeReset(resetAt);

	return (
		<div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
			<header className="mb-12 max-w-2xl">
				<p className="eyebrow mb-4">Overview</p>
				<h1 className="text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-[2.6rem]">
					Good to see you, {firstName}.{" "}
					<span className="font-display text-brand">Keep going.</span>
				</h1>
				<p className="mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
					Here’s where your workspace stands — balance, recent
					activity, and a quick way back into the conversation.
				</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-12">
				<div className="flex flex-col gap-6 lg:col-span-8">
					{/* BALANCE */}
					<section className="rounded-xl border border-border bg-card">
						<div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
							<div>
								<p className="eyebrow mb-3">Balance</p>
								<div className="flex items-baseline gap-3">
									<span className="text-[3.4rem] font-medium leading-none tracking-[-0.03em]">
										{credits}
									</span>
									<span className="text-[13.5px] text-muted-foreground">
										messages remaining
									</span>
								</div>
								<p className="mt-4 max-w-xs text-[13.5px] leading-6 text-muted-foreground">
									One message costs one credit.
									{resetNote
										? ` Your balance ${resetNote}.`
										: " It refreshes automatically when it runs out."}
								</p>
							</div>
							<Button asChild variant="outline" size="sm">
								<Link href="/chatbot">
									Open workspace
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</section>

					{/* ACTIVITY */}
					<section className="overflow-hidden rounded-xl border border-border bg-card">
						<div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
							<h2 className="text-[15px] font-medium">Recent activity</h2>
							<span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
								{messages.length > 0
									? `Last ${messages.length}`
									: "0 messages"}
							</span>
						</div>
						{messages.length === 0 ? (
							<div className="flex flex-col items-start gap-4 px-4 py-12 sm:px-6">
								<p className="text-[14.5px] leading-6 text-muted-foreground">
									No messages yet. Your first saved
									conversation is one prompt away.
								</p>
								<Button asChild variant="brand" size="sm">
									<Link href="/chatbot">Start your first thread</Link>
								</Button>
							</div>
						) : (
							<ul className="divide-y divide-border">
								{messages.map((message) => {
									const isUser = message.role === "user";
									const preview =
										message.content.length > 96
											? `${message.content.slice(0, 96)}…`
											: message.content;
									return (
										<li key={message.id}>
											<Link
												href="/chatbot"
												className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50">
												<span
													className={cn(
														"grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
														isUser
															? "border-border bg-muted text-muted-foreground"
															: "border-brand/25 bg-brand/10 text-brand",
													)}>
													{isUser ? (
														<ArrowUp className="h-4 w-4" />
													) : (
														<CircleDot className="h-4 w-4" />
													)}
												</span>
												<div className="min-w-0 flex-1">
													<p className="truncate text-[14px] text-foreground/90">
														{preview}
													</p>
													<p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
														{message.role}
													</p>
												</div>
												<span className="shrink-0 font-mono text-xs text-muted-foreground">
													{timeAgo(message.created_at)}
												</span>
											</Link>
										</li>
									);
								})}
							</ul>
						)}
					</section>
				</div>

				<div className="flex flex-col gap-6 lg:col-span-4">
					{/* QUICK START */}
					<section className="rounded-xl border border-border bg-card p-6">
						<p className="eyebrow mb-3">Quick start</p>
						<h2 className="text-[17px] font-medium">Start a new thread</h2>
						<p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
							Dive straight into a fresh saved conversation. One
							credit per message.
						</p>
						<Button asChild size="lg" className="mt-5 w-full">
							<Link href="/chatbot">
								Open the workspace
								<ArrowUpRight className="h-4 w-4" />
							</Link>
						</Button>
					</section>

					{/* ACCOUNT */}
					<section className="rounded-xl border border-border bg-card">
						<h2 className="border-b border-border px-4 py-4 text-[15px] font-medium sm:px-6">
							Your account
						</h2>
						<div className="grid gap-4 px-4 py-5 sm:px-6">
							<div className="grid gap-1">
								<span className="text-xs text-muted-foreground">
									Email
								</span>
								<span className="truncate text-[14px]" title={email}>
									{email}
								</span>
							</div>
							<div className="grid gap-1">
								<span className="text-xs text-muted-foreground">
									Member since
								</span>
								<span className="text-[14px]">
									{user.created_at
										? new Intl.DateTimeFormat("en", {
												month: "long",
												year: "numeric",
											}).format(new Date(user.created_at))
										: "—"}
								</span>
							</div>
							<div className="pt-1">
								<LogoutButton />
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}