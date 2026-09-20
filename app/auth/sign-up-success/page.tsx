import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Check your email",
};

export default function Page() {
	return (
		<AuthShell
			eyebrow="Almost there"
			title="Check your email"
			description="One last step before your first saved conversation.">
			<div className="flex flex-col gap-5">
				<div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
					<span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
						<Check className="h-4 w-4" />
					</span>
					<div>
						<p className="text-[14.5px] font-medium">Confirmation sent</p>
						<p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">
							We emailed you a confirmation link. Open it to verify
							your address, then sign in to start working.
						</p>
					</div>
				</div>
				<Button asChild variant="outline" size="lg" className="w-full">
					<Link href="/auth/login">Go to sign in</Link>
				</Button>
			</div>
		</AuthShell>
	);
}