"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			// The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/update-password`,
			});
			if (error) throw error;
			setSuccess(true);
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<div className="flex flex-col gap-5">
				<div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
					<span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
						<Check className="h-4 w-4" />
					</span>
					<div>
						<p className="text-[14.5px] font-medium">Check your email</p>
						<p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">
							If you registered with this email address, you’ll find a
							reset link waiting for you. The link expires quickly, so
							follow it soon.
						</p>
					</div>
				</div>
				<Button asChild variant="outline" size="lg" className="w-full">
					<Link href="/auth/login">Back to sign in</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
				<div className="grid gap-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						required
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
					{isLoading ? "Sending link…" : "Send reset link"}
				</Button>
			</form>
			<p className="border-t border-border pt-5 text-center text-[13.5px] text-muted-foreground">
				Remembered it after all?{" "}
				<Link
					href="/auth/login"
					className="font-medium text-foreground underline-offset-4 hover:underline">
					Sign in
				</Link>
			</p>
		</div>
	);
}