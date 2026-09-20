import Link from "next/link";
import { Suspense } from "react";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

async function AuthedActions() {
	if (!hasEnvVars) {
		return (
			<span className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex">
				<CircleAlert className="h-3.5 w-3.5" />
				Not configured
			</span>
		);
	}

	const supabase = await createClient();
	const { data } = await supabase.auth.getClaims();
	const claims = data?.claims as { email?: string } | null;

	if (claims?.email) {
		const name = claims.email.split("@")[0];
		return (
			<div className="flex items-center gap-3">
				<span
					className="hidden max-w-[160px] truncate text-[13px] text-muted-foreground md:block"
					title={claims.email}>
					{name}
				</span>
				<span className="hidden h-5 w-px bg-border md:block" />
				<Suspense>
					<LogoutButton />
				</Suspense>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				asChild
				variant="ghost"
				size="sm"
				className="max-[420px]:hidden">
				<Link href="/auth/login">Sign in</Link>
			</Button>
			<Button asChild variant="brand" size="sm">
				<Link href="/auth/sign-up">Get started</Link>
			</Button>
		</div>
	);
}

export function HeaderActions() {
	return (
		<Suspense
			fallback={
				<div className="h-8 w-8 rounded-md border border-border animate-pulse-soft" />
			}>
			<AuthedActions />
		</Suspense>
	);
}