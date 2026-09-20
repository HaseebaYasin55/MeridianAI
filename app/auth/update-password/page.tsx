import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/update-password-form";

export const metadata: Metadata = {
	title: "Update password",
};

export default function Page() {
	return (
		<AuthShell
			eyebrow="Account access"
			title="Set a new password"
			description="Choose a strong password to restore access to your workspace.">
			<UpdatePasswordForm />
		</AuthShell>
	);
}