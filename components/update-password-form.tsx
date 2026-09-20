"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

export function UpdatePasswordForm() {
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			// Update this route to redirect to an authenticated route. The user already has an active session.
			router.push("/protected");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
			<div className="grid gap-2">
				<Label htmlFor="password">New password</Label>
				<Input
					id="password"
					type="password"
					placeholder="At least 8 characters"
					required
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			{error && (
				<div
					role="alert"
					className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[13px] leading-5 text-destructive">
					<TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
					{error}
				</div>
			)}
			<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
				{isLoading ? "Saving…" : "Save new password"}
			</Button>
		</form>
	);
}