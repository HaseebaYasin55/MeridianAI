"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

export function SignUpForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		if (password !== repeatPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/protected`,
				},
			});
			if (error) throw error;
			router.push("/auth/sign-up-success");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<form onSubmit={handleSignUp} className="flex flex-col gap-5">
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
				<div className="grid gap-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						required
						autoComplete="new-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="repeat-password">Repeat password</Label>
					<Input
						id="repeat-password"
						type="password"
						required
						autoComplete="new-password"
						value={repeatPassword}
						onChange={(e) => setRepeatPassword(e.target.value)}
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
					{isLoading ? "Creating account…" : "Create account"}
				</Button>
				<p className="text-center text-[12.5px] leading-5 text-muted-foreground">
					New accounts start with 10 credits. We’ll email you a
					confirmation link.
				</p>
			</form>
			<p className="border-t border-border pt-5 text-center text-[13.5px] text-muted-foreground">
				Already have an account?{" "}
				<Link
					href="/auth/login"
					className="font-medium text-foreground underline-offset-4 hover:underline">
					Sign in
				</Link>
			</p>
		</div>
	);
}