"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
	ArrowUp,
	CircleDot,
	LayoutDashboard,
	Menu,
	Plus,
	Sparkles,
	TriangleAlert,
	X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";
import { Markdown } from "@/components/markdown";
import { LogoutButton } from "@/components/logout-button";
import { brand } from "@/lib/brand";
import { timeAgo } from "@/lib/datetime";
import { cn } from "@/lib/utils";

type Message = {
	id?: string;
	role: "user" | "assistant";
	content: string;
	created_at?: string;
};

type ChatInterfaceProps = {
	initialCredits: number;
	initialMessages: Message[];
	userEmail: string;
};

export function ChatInterface({
	initialCredits,
	initialMessages,
	userEmail,
}: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [creditsLeft, setCreditsLeft] = useState(initialCredits);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const scrollRef = useRef<HTMLDivElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		const el = scrollRef.current;
		el?.scrollTo({
			top: el.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, isLoading]);

	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
	}, [input]);

	const loadCredits = useCallback(async () => {
		try {
			const response = await fetch("/api/credits", { method: "GET" });
			const data = (await response.json()) as {
				creditsLeft?: number;
				error?: string;
			};

			if (!response.ok) {
				throw new Error(data.error ?? "Unable to load your credits.");
			}

			if (typeof data.creditsLeft === "number") {
				setCreditsLeft(data.creditsLeft);
			}
		} catch (caughtError) {
			const message =
				caughtError instanceof Error
					? caughtError.message
					: "Unable to load your credits.";
			setError(message);
		}
	}, []);

	useEffect(() => {
		void loadCredits();
		const intervalId = window.setInterval(() => {
			void loadCredits();
		}, 3000);

		return () => window.clearInterval(intervalId);
	}, [loadCredits]);

	const handleClearChat = useCallback(() => {
		setMessages([]);
		setError(null);
		setSidebarOpen(false);
	}, []);

	const applyPrompt = (prompt: string) => {
		setInput(prompt);
		setTimeout(() => textareaRef.current?.focus(), 0);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedInput = input.trim();
		if (!trimmedInput || isLoading) return;

		const userMessage: Message = {
			role: "user",
			content: trimmedInput,
		};

		setMessages((current) => [...current, userMessage]);
		setInput("");
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: trimmedInput }),
			});

			const data = (await response.json()) as {
				reply?: string;
				error?: string;
				creditsLeft?: number;
			};

			if (!response.ok) {
				throw new Error(data.error ?? "Unable to send message.");
			}

			if (typeof data.creditsLeft === "number") {
				setCreditsLeft(data.creditsLeft);
			} else {
				await loadCredits();
			}

			const assistantReply: Message = {
				role: "assistant",
				content: data.reply ?? "No response returned.",
			};

			setMessages((current) => [...current, assistantReply]);
		} catch (caughtError) {
			const message =
				caughtError instanceof Error
					? caughtError.message
					: "Something went wrong.";

			setError(message);
			setMessages((current) => [
				...current,
				{
					role: "assistant",
					content:
						"I could not respond right now. Please try again in a moment.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const isZeroCredits = creditsLeft <= 0;
	const lastTimestamp =
		messages.length > 0 ? messages[messages.length - 1].created_at : undefined;
	const firstUserPreview =
		messages.find((message) => message.role === "user")?.content ?? "";
	const isSidebarEmpty = messages.length === 0;
	const userName = userEmail.split("@")[0] || "you";

	const sidebar = (
		<div className="flex h-full flex-col">
			<div className="flex h-16 items-center justify-between border-b border-border/70 px-5">
				<Wordmark href="/" />
				<button
					type="button"
					onClick={() => setSidebarOpen(false)}
					aria-label="Close menu"
					className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden">
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="flex-1 space-y-7 overflow-y-auto px-3 py-5">
				<div className="px-2">
					<Button
						variant="brand"
						className="w-full justify-start gap-2"
						onClick={handleClearChat}
						disabled={isLoading}>
						<Plus className="h-4 w-4" />
						New thread
					</Button>
					<p className="mt-2 px-1 text-xs leading-5 text-muted-foreground">
						Starting a new thread clears this view. Your history
						remains saved in the database.
					</p>
				</div>

				<div className="space-y-2.5">
					<p className="eyebrow px-2">This session</p>
					{isSidebarEmpty ? (
						<p className="px-2 text-[13px] leading-6 text-muted-foreground">
							No thread yet. Write your first message to begin.
						</p>
					) : (
						<button
							type="button"
							onClick={() => setSidebarOpen(false)}
							className="group w-full rounded-lg border border-border bg-background px-3.5 py-3 text-left transition-colors hover:border-brand/40 hover:bg-accent/60">
							<span className="block truncate text-[13.5px] font-medium text-foreground">
								Working thread
							</span>
							<span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
								{messages.length}{" "}
								{messages.length === 1 ? "message" : "messages"}
								{lastTimestamp ? ` · ${timeAgo(lastTimestamp)}` : ""}
							</span>
							{firstUserPreview && (
								<span className="mt-2 block truncate text-[12.5px] text-muted-foreground">
									{firstUserPreview}
								</span>
							)}
						</button>
					)}
				</div>

				<div className="space-y-2.5">
					<p className="eyebrow px-2">Navigation</p>
					<Link
						href="/protected"
						onClick={() => setSidebarOpen(false)}
						className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
						<LayoutDashboard className="h-4 w-4" />
						Overview
					</Link>
				</div>
			</div>

			<div className="space-y-4 border-t border-border/70 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
				<div className="flex items-center justify-between">
					<span className="eyebrow">Balance</span>
					<span
						className={cn(
							"font-mono text-sm",
							isZeroCredits ? "text-brand" : "text-foreground",
						)}>
						{creditsLeft}
					</span>
				</div>
				{isZeroCredits && (
					<p className="text-[12px] leading-5 text-muted-foreground">
						You’re out of credits. Your balance refreshes
						automatically.
					</p>
				)}
				<div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
					<div className="min-w-0">
						<p className="truncate text-[13px] font-medium" title={userEmail}>
							{userName}
						</p>
						<p className="truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
							{userEmail}
						</p>
					</div>
					<LogoutButton />
				</div>
			</div>
		</div>
	);

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:flex-row">
			{/* DESKTOP SIDEBAR */}
			<aside className="hidden w-[280px] shrink-0 border-r border-border bg-muted/30 lg:block">
				{sidebar}
			</aside>

			{/* MOBILE DRAWER */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/45 lg:hidden"
					onClick={() => setSidebarOpen(false)}
					aria-hidden
				/>
			)}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-[298px] border-r border-border bg-background transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}>
				{sidebar}
			</div>

			{/* MAIN COLUMN */}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* MOBILE HEADER */}
				<header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4 lg:hidden">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						aria-label="Open menu"
						className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
						<Menu className="h-5 w-5" />
					</button>
					<Wordmark href="/" />
					<span
						className={cn(
							"inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] tracking-[0.06em]",
							isZeroCredits ? "text-brand" : "text-muted-foreground",
						)}>
						<span
							className={cn(
								"h-1.5 w-1.5 rounded-full",
								isZeroCredits ? "animate-pulse-soft bg-brand" : "bg-brand",
							)}
						/>
						{creditsLeft}
					</span>
				</header>

				{/* DESKTOP TOP BAR */}
				<div className="hidden h-16 shrink-0 items-center justify-between border-b border-border/70 px-6 lg:flex">
					<div className="flex items-center gap-3">
						<span className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background">
							<CircleDot className="h-4 w-4 text-brand" />
						</span>
						<div>
							<p className="text-[13.5px] font-medium leading-tight">
								Working thread
							</p>
							<p className="text-xs leading-tight text-muted-foreground">
								Persistent — saved to your account as you go
							</p>
						</div>
					</div>
					<span
						className={cn(
							"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.08em]",
							isZeroCredits
								? "border-brand/40 text-brand"
								: "border-border text-muted-foreground",
						)}>
						<span className="h-1.5 w-1.5 rounded-full bg-brand" />
						{creditsLeft} credits
					</span>
				</div>

				{/* CONVERSATION */}
				<div
					ref={scrollRef}
					className="flex-1 overflow-y-auto overscroll-contain"
					role="log"
					aria-label="Conversation">
					<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
						{messages.length === 0 ? (
							<div className="animate-fade-up">
								<p className="eyebrow mb-5">Working thread</p>
								<h1 className="max-w-lg text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
									Start where you{" "}
									<span className="font-display text-brand">
										left off.
									</span>
								</h1>
								<p className="mt-4 max-w-lg text-[15px] leading-7 text-muted-foreground">
									Ask anything and {brand.name} will answer in
									clean, rendered text — lists, code, and all.
									Every exchange is saved to your account.
								</p>

								<div className="mt-9 grid max-w-xl gap-2.5">
									<span className="eyebrow mb-1">Try one of these</span>
									{brand.starterPrompts.map((prompt) => (
										<button
											type="button"
											key={prompt}
											onClick={() => applyPrompt(prompt)}
											disabled={isLoading}
											className="group flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-[13.5px] leading-6 text-foreground/85 transition-colors hover:border-brand/40 hover:bg-accent/50 disabled:opacity-45">
											<span>
												<Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />
											</span>
											<span className="flex-1">{prompt}</span>
											<ArrowUp className="mt-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
										</button>
									))}
								</div>

								<p className="mt-9 max-w-lg border-t border-border/70 pt-4 text-[12.5px] leading-5 text-muted-foreground">
									Balance: {creditsLeft} credits · one message
									per credit · refills automatically
								</p>
							</div>
						) : (
							<>
								{messages.map((message, index) => {
									const isUser = message.role === "user";
									return (
										<div
											key={`${message.id ?? message.role}-${index}`}
											className={cn(
												"animate-fade-up",
												isUser ? "flex justify-end" : "flex gap-3",
											)}>
											{!isUser && (
												<span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-background">
													<CircleDot className="h-4 w-4 text-brand" />
												</span>
											)}
											{isUser ? (
												<div className="max-w-[85%] whitespace-pre-wrap break-words rounded-xl rounded-br-sm bg-foreground px-4 py-2.5 text-[14.5px] leading-relaxed text-background sm:max-w-[75%]">
													{message.content}
												</div>
											) : (
												<div className="min-w-0 flex-1 max-w-[95%]">
													<div className="pt-1">
														<Markdown content={message.content} />
													</div>
												</div>
											)}
										</div>
									);
								})}

								{isLoading && (
									<div className="flex animate-fade-in gap-3">
										<span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-background">
											<CircleDot className="h-4 w-4 text-brand" />
										</span>
										<span
											className="inline-flex items-center gap-2.5 rounded-lg border border-border bg-background px-4 py-2.5 text-[13.5px] text-muted-foreground"
											aria-live="polite">
											<span className="flex items-center gap-1">
												<span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-foreground/60 [animation-delay:0ms]" />
												<span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-foreground/60 [animation-delay:150ms]" />
												<span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-foreground/60 [animation-delay:300ms]" />
											</span>
											Thinking
										</span>
									</div>
								)}
							</>
						)}
					</div>
				</div>

				{error && (
					<div className="px-4 sm:px-6">
						<div className="mx-auto mb-3 flex max-w-3xl items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] leading-5 text-destructive motion-safe:animate-fade-in">
							<TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
							{error}
						</div>
					</div>
				)}

				{isZeroCredits && !isLoading && (
					<div className="px-4 sm:px-6">
						<div className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-[13px] leading-5 text-foreground/80 motion-safe:animate-fade-in">
							<span className="h-1.5 w-1.5 rounded-full bg-brand" />
							You’re out of credits. The balance refreshes
							automatically — check back soon.
						</div>
					</div>
				)}

				{/* COMPOSER */}
				<div className="shrink-0 border-t border-border/70 bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
					<form
						onSubmit={handleSubmit}
						className="mx-auto max-w-3xl rounded-xl border border-input bg-background shadow-sm transition-[box-shadow,border-color] duration-200 focus-within:border-brand/40 focus-within:shadow-[0_0_0_3px_hsl(var(--ring)/0.18)] focus-within:ring-0">
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(event) => setInput(event.target.value)}
							onKeyDown={(event) => {
								if (
									event.key === "Enter" &&
									!event.shiftKey &&
									!event.nativeEvent.isComposing
								) {
									event.preventDefault();
									const form = event.currentTarget.form;
									if (form) form.requestSubmit();
								}
							}}
							rows={1}
							placeholder="Ask anything — press Enter to send"
							disabled={isLoading}
							aria-label="Your message"
							className="block max-h-[168px] w-full resize-none bg-transparent px-4 pb-0.5 pt-3.5 text-[14.5px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
						/>
						<div className="flex items-center justify-between gap-3 px-3 pb-2.5 pt-1.5">
<span className="hidden shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground min-[360px]:block">
							{isLoading ? "Working…" : "Enter to send"}
							{!isLoading && (
								<span className="hidden sm:inline">
									{" "}· Shift+Enter for a new line
								</span>
							)}
						</span>
							<div className="flex items-center gap-2">
								{messages.length > 0 && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={handleClearChat}
										disabled={isLoading}
										className="text-muted-foreground">
										Clear
									</Button>
								)}
								<Button
									type="submit"
									variant="brand"
									size="sm"
									disabled={isLoading || !input.trim()}
									aria-label="Send message">
									{isLoading ? "Sending" : "Send"}
									<ArrowUp className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}