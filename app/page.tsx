import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/components/product-preview";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { brand } from "@/lib/brand";

const steps = [
	{
		number: "01",
		title: "Ask",
		body: "Type in plain language. One message costs one credit from your balance — no surprises, no arbitrary limits.",
	},
	{
		number: "02",
		title: "Answer",
		body: "The workspace replies with a clear, structured response: rendered markdown, tidy lists, and code blocks when you need them.",
	},
	{
		number: "03",
		title: "Keep",
		body: "Every exchange is saved to your account. Close the tab, come back later, and pick up exactly where you left off.",
	},
];

export default function Home() {
	return (
		<div className="flex min-h-svh flex-col">
			<SiteHeader />

			<main className="flex-1">
				{/* HERO */}
				<section className="relative overflow-hidden">
					<div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 pb-20 pt-16 text-center sm:px-8 sm:pt-24">
						<p className="eyebrow animate-fade-in">{brand.heroEyebrow}</p>
						<h1 className="max-w-3xl animate-fade-up text-[2.35rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-6xl md:text-[4.2rem]">
							Focused thinking,{" "}
							<em className="font-display text-brand">
								carefully kept.
							</em>
						</h1>
						<p className="max-w-xl animate-fade-up text-[15px] leading-7 text-muted-foreground sm:text-base [animation-delay:80ms]">
							{brand.description}
						</p>
						<div className="flex animate-fade-up flex-col items-center gap-3 [animation-delay:160ms] sm:flex-row">
							<Button asChild size="xl">
								<Link href="/chatbot">
									Open the workspace
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild size="xl" variant="outline">
								<Link href="#how">How it works</Link>
							</Button>
						</div>
						<p className="animate-fade-up font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground [animation-delay:240ms]">
							New accounts start with 10 credits · one message per
							credit · refreshed automatically
						</p>
					</div>

					<div className="flex animate-scale-in justify-center px-5 pb-24 [animation-delay:300ms] sm:px-8">
						<ProductPreview />
					</div>
				</section>

				{/* HOW IT WORKS */}
				<section
					id="how"
					className="scroll-mt-24 border-y border-border/70 bg-muted/40">
					<div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.4fr]">
						<div>
							<p className="eyebrow mb-4">How it works</p>
							<h2 className="text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl">
								Three steps between{" "}
								<em className="font-display">question</em> and{" "}
								<em className="font-display">keeping</em>.
							</h2>
							<p className="mt-4 max-w-sm text-[15px] leading-7 text-muted-foreground">
								The workspace is deliberately uncomplicated: a
								place to ask, a place to read, and a record that
								stays with you.
							</p>
						</div>
						<ol className="divide-y divide-border">
							{steps.map((step) => (
								<li
									key={step.number}
									className="group grid gap-3 py-7 first:pt-0 last:pb-0 sm:grid-cols-[72px_1fr]">
									<span className="font-display text-3xl text-muted-foreground/60 transition-colors duration-300 group-hover:text-brand">
										{step.number}
									</span>
									<div>
										<h3 className="mb-1.5 text-[17px] font-medium">
											{step.title}
										</h3>
										<p className="max-w-md text-[14.5px] leading-7 text-muted-foreground">
											{step.body}
										</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				</section>

				{/* CTA */}
				<section id="start" className="scroll-mt-24">
					<div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
						<div className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-16 text-center sm:px-12 sm:py-20">
							<div className="relative">
								<p className="eyebrow mb-4">Get started</p>
								<h2 className="mx-auto max-w-2xl text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">
									Start thinking in{" "}
									<em className="font-display text-brand">
										Meridian.
									</em>
								</h2>
								<p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-muted-foreground">
									Create an account and make your first saved
									conversation in under a minute. No card, no
									commitment — just credits.
								</p>
								<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
									<Button asChild size="xl">
										<Link href="/auth/sign-up">
											Create your account
											<ArrowRight className="h-4 w-4" />
										</Link>
									</Button>
									<Button asChild size="xl" variant="ghost">
										<Link href="/auth/login">Sign in</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}