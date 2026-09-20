import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
	title: "Sign in",
};

export default function Page() {
	return (
		<AuthShell
			eyebrow="Welcome back"
			title="Sign in to your workspace"
			description="Pick up your conversations exactly where you left them.">
			<LoginForm />
		</AuthShell>
	);
}