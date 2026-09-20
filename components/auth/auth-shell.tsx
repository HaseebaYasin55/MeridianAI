import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";

const facts = [
	"Conversations persist between visits",
	"Answers render with markdown and code",
	"One credit per message, always visible",
];

export function AuthShell({
	eyebrow,
	title,
	description,
	children,
	footer,
}: {
	eyebrow: string;
	title: string;
	description: string;
	children: ReactNode;
	footer?: ReactNode;
}) {
	return (
		<div className="flex min-h-svh">
			<aside className="hidden w-[min(46%,560px)] flex-col justify-between border-r border-border/70 bg-muted/40 px-10 py-10 lg:flex xl:px-14">
				<Wordmark href="/" />
				<div className="max-w-md">
					<p className="eyebrow mb-5">Meridian — AI workspace</p>
					<h2 className="text-3xl font-medium leading-[1.15] tracking-[-0.02em] xl:text-[2.6rem]">
						Every good answer starts with a{" "}
						<em className="font-display text-brand">good question.</em>
					</h2>
					<p className="mt-5 max-w-sm text-[14.5px] leading-7 text-muted-foreground">
						Sign in to the workspace and pick up your conversation
						exactly where you left it.
					</p>
					<ul className="mt-8 space-y-3">
						{facts.map((fact) => (
							<li key={fact} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
								<Check className="h-4 w-4 shrink-0 text-brand" />
								{fact}
							</li>
						))}
					</ul>
				</div>
				<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
					Meridian — focused thinking, carefully kept
				</p>
			</aside>

			<main className="flex flex-1 flex-col">
				<div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end">
					<div className="lg:hidden">
						<Wordmark href="/" />
					</div>
					<div className="flex items-center gap-3">
						<Wordmark href="/" className="hidden lg:flex" size="md" />
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
					<div className="w-full max-w-[400px] animate-fade-up">
						<p className="eyebrow mb-3">{eyebrow}</p>
						<h1 className="text-[1.9rem] font-medium leading-tight tracking-[-0.02em]">
							{title}
						</h1>
						<p className="mb-8 mt-2.5 text-[14.5px] leading-6 text-muted-foreground">
							{description}
						</p>
						{children}
						{footer}
					</div>
				</div>
			</main>
		</div>
	);
}