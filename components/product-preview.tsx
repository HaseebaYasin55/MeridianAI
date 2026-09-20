import { ArrowUp, Check, CircleDot, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

function CreditChip() {
	return (
		<span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
			<span className="relative flex h-1.5 w-1.5">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60 motion-reduce:hidden" />
				<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
			</span>
			8 credits
		</span>
	);
}

function BalanceMeter() {
	const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	return (
		<div className="grid grid-cols-10 gap-1.5">
			{slots.map((slot) => (
				<span
					key={slot}
					className={cn(
						"h-1.5 rounded-full",
						slot <= 8 ? "bg-brand" : "bg-border",
					)}
				/>
			))}
		</div>
	);
}

function MessageBubble({
	role,
	children,
	delay = 0,
}: {
	role: "user" | "assistant";
	children: React.ReactNode;
	delay?: number;
}) {
	const isUser = role === "user";
	return (
		<div
			className={cn(
				"flex w-full animate-fade-up gap-3 motion-reduce:animate-none",
				isUser && "justify-end",
			)}
			style={{ animationDelay: `${delay}ms` }}>
			{!isUser && (
				<span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border border-border bg-background">
					<CircleDot className="h-3.5 w-3.5 text-brand" />
				</span>
			)}
			<div
				className={cn(
					"max-w-[82%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed",
					isUser
						? "rounded-bl-sm bg-foreground text-background"
						: "rounded-tr-sm border border-border bg-background text-foreground/90",
				)}>
				{children}
			</div>
		</div>
	);
}

function AssistantReply() {
	return (
		<div className="space-y-1.5">
			<p>
				<strong className="font-medium text-foreground">Launch brief</strong>{" "}
				— three moves
			</p>
			<ul className="space-y-1">
				<li className="flex gap-2">
					<span className="mt-[0.5em] inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-brand" />
					<span>Land on a single core loop, not a feature list.</span>
				</li>
				<li className="flex gap-2">
					<span className="mt-[0.5em] inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-brand" />
					<span>Ship a quiet, opinions-first visual style.</span>
				</li>
				<li className="flex gap-2">
					<span className="mt-[0.5em] inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-brand" />
					<span>Measure retention on day one, not traffic.</span>
				</li>
			</ul>
		</div>
	);
}

export function ProductPreview() {
	return (
		<div className="relative mx-auto w-full max-w-4xl">
			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)]">
				<div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
					<div className="flex items-center gap-3">
						<span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
							Meridian — Workspace
						</span>
					</div>
					<div className="flex items-center gap-2">
						<CreditChip />
					</div>
				</div>

				<div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_240px]">
					<div className="min-w-0">
						<div className="space-y-3">
							<div className="px-1 pb-2">
								<p className="eyebrow">New thread</p>
							</div>
							<MessageBubble role="user" delay={60}>
								Draft a short brief for launching a simple
								note-taking app.
							</MessageBubble>
							<MessageBubble role="assistant" delay={180}>
								<AssistantReply />
							</MessageBubble>
							<MessageBubble role="user" delay={300}>
								Keep it under four sentences with three target
								users.
							</MessageBubble>

							<div
								className="flex w-full animate-fade-up items-center gap-3 motion-reduce:animate-none"
								style={{ animationDelay: "420ms" }}>
								<span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border border-border bg-background">
									<CircleDot className="h-3.5 w-3.5 text-brand" />
								</span>
								<span className="flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] text-muted-foreground">
									<span className="flex items-center gap-1">
										<span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-foreground/60 [animation-delay:0ms]" />
										<span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-foreground/60 [animation-delay:150ms]" />
										<span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-foreground/60 [animation-delay:300ms]" />
									</span>
									<span className="ml-1">Thinking</span>
									<Sparkles className="ml-1 h-3.5 w-3.5 text-brand" />
								</span>
							</div>
						</div>
					</div>

					<aside className="hidden flex-col gap-5 border-l border-border pl-6 lg:flex">
						<div>
							<p className="eyebrow mb-3">This session</p>
							<ul className="space-y-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
								<li className="flex gap-2.5">
									<Check className="h-3.5 w-3.5 shrink-0 text-brand" />
									Saved to your account as you go
								</li>
								<li className="flex gap-2.5">
									<Check className="h-3.5 w-3.5 shrink-0 text-brand" />
									Markdown-rendered answers
								</li>
								<li className="flex gap-2.5">
									<Check className="h-3.5 w-3.5 shrink-0 text-brand" />
									One credit per message
								</li>
							</ul>
						</div>
						<p className="hairline" />
						<div>
							<div className="mb-3 flex items-center justify-between">
								<p className="eyebrow">Balance</p>
								<span className="font-mono text-xs text-foreground">
									8 / 10
								</span>
							</div>
							<BalanceMeter />
							<p className="mt-3 text-[12px] leading-5 text-muted-foreground">
								Credits refresh automatically, so you always
								know exactly where you stand.
							</p>
						</div>
					</aside>
				</div>

				<div className="border-t border-border px-4 py-3 sm:px-5">
					<div className="flex items-center gap-3">
						<div className="h-9 flex-1 rounded-lg border border-border bg-background px-3.5 text-[13px] leading-[2.3rem] text-muted-foreground">
							Ask anything, keep going…
						</div>
						<button
							type="button"
							aria-hidden
							tabIndex={-1}
							className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-foreground text-background transition-colors">
							<ArrowUp className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}