import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { HeaderActions } from "@/components/header-actions";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-svh flex-col">
			<header className="sticky top-0 z-40 border-b border-border/70 bg-background">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
					<div className="flex items-center gap-9">
						<Wordmark href="/" />
						<nav className="hidden items-center gap-6 md:flex">
							<Link
								href="/protected"
								className="text-[13.5px] font-medium text-foreground">
								Overview
							</Link>
							<Link
								href="/chatbot"
								className="text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground">
								Workspace
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-1.5">
						<HeaderActions />
					</div>
				</div>
			</header>

			<main className="flex-1">{children}</main>

			<footer className="border-t border-border/70">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Meridian
					</p>
					<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						AI workspace
					</p>
				</div>
			</footer>
		</div>
	);
}