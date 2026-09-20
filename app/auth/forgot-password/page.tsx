import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
	title: "Reset password",
};

export default function Page() {
	return (
		<AuthShell
			eyebrow="Account access"
			title="Reset your password"
			description="Type in your email and we’ll send you a link to set a new password.">
			<ForgotPasswordForm />
		</AuthShell>
	);
}