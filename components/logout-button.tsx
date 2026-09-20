"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const logout = async () => {
		setIsLoading(true);
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/auth/login");
		router.refresh();
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={logout}
			disabled={isLoading}
			className="text-muted-foreground">
			<LogOut className="h-4 w-4" />
			{isLoading ? "Signing out" : "Sign out"}
		</Button>
	);
}