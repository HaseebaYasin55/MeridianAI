import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { HeaderActions } from "@/components/header-actions";
import { ThemeSwitcher } from "@/components/theme-switcher";

const navLinks = [
	{ href: "#how", label: "How it works" },
	{ href: "#start", label: "Get started" },
];

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-border/70 bg-background">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
				<div className="flex items-center gap-10">
					<Wordmark href="/" />
					<nav className="hidden items-center gap-7 md:flex">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground">
								{link.label}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-1.5">
					<ThemeSwitcher />
					<HeaderActions />
				</div>
			</div>
		</header>
	);
}