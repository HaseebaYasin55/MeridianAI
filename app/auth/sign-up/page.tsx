import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata: Metadata = {
	title: "Create account",
};

export default function Page() {
	return (
		<AuthShell
			eyebrow="Get started"
			title="Create your account"
			description="Start with 10 credits and a persistent workspace — no card, no commitment.">
			<SignUpForm />
		</AuthShell>
	);
}