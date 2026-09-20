import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { brand } from "@/lib/brand";

export function SiteFooter() {
	return (
		<footer className="border-t border-border/70">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
				<div className="flex flex-col gap-3">
					<Wordmark href="/" />
					<p className="max-w-xs text-[13px] leading-6 text-muted-foreground">
						{brand.tagline} Every conversation saved. Every credit
						accounted for.
					</p>
				</div>
				<div className="flex flex-wrap gap-x-16 gap-y-6">
					<div className="flex flex-col gap-2.5">
						<span className="eyebrow">Product</span>
						<Link
							href="/chatbot"
							className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground">
							Workspace
						</Link>
						<Link
							href="/protected"
							className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground">
							Dashboard
						</Link>
					</div>
					<div className="flex flex-col gap-2.5">
						<span className="eyebrow">Account</span>
						<Link
							href="/auth/login"
							className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground">
							Sign in
						</Link>
						<Link
							href="/auth/sign-up"
							className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground">
							Create account
						</Link>
					</div>
				</div>
			</div>
			<div className="border-t border-border/70">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} {brand.name}
					</p>
					<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						{brand.name} Studio
					</p>
				</div>
			</div>
		</footer>
	);
}