"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
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
		<div className="flex flex-col gap-6">
			<form onSubmit={handleLogin} className="flex flex-col gap-5">
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
					<div className="flex items-baseline justify-between">
						<Label htmlFor="password">Password</Label>
						<Link
							href="/auth/forgot-password"
							className="text-[13px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
							Forgot your password?
						</Link>
					</div>
					<Input
						id="password"
						type="password"
						required
						autoComplete="current-password"
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
					{isLoading ? "Signing in…" : "Sign in"}
				</Button>
			</form>
			<p className="border-t border-border pt-5 text-center text-[13.5px] text-muted-foreground">
				Don’t have an account?{" "}
				<Link
					href="/auth/sign-up"
					className="font-medium text-foreground underline-offset-4 hover:underline">
					Create one
				</Link>
			</p>
		</div>
	);
}