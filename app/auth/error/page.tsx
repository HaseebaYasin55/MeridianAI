import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TriangleAlert } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Something went wrong",
};

async function ErrorContent({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	const { error } = await searchParams;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
				<span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-destructive/10">
					<TriangleAlert className="h-4 w-4 text-destructive" />
				</span>
				<p className="text-[13.5px] leading-6 text-foreground/80">
					{error ? (
						<>
							The confirmation link didn’t go through
							<span className="mt-1 block font-mono text-xs text-muted-foreground">
								Code: {error}
							</span>
						</>
					) : (
						"An unspecified error occurred while processing your request."
					)}
				</p>
			</div>
			<Button asChild variant="outline" size="lg" className="w-full">
				<Link href="/auth/login">Back to sign in</Link>
			</Button>
		</div>
	);
}

export default function Page({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	return (
		<AuthShell
			eyebrow="Sign-in issue"
			title="Sorry, something went wrong."
			description="This usually means an expired or malformed confirmation link. You can try again from sign in.">
			<Suspense>
				<ErrorContent searchParams={searchParams} />
			</Suspense>
		</AuthShell>
	);
}