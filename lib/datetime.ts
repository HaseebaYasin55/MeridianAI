export function timeAgo(input: string | Date): string {
	const date = typeof input === "string" ? new Date(input) : input;
	if (Number.isNaN(date.getTime())) return "";

	const seconds = Math.round((date.getTime() - Date.now()) / 1000);
	const abs = Math.abs(seconds);

	if (abs < 60) return "just now";

	const minutes = Math.round(abs / 60);
	if (minutes < 60) return `${minutes}m ago`;

	const hours = Math.round(abs / 3600);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.round(abs / 86400);
	if (days < 7) return `${days}d ago`;

	const weeks = Math.round(abs / 604800);
	if (weeks < 5) return `${weeks}w ago`;

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
	}).format(date);
}

export function formatClock(input: string | Date): string {
	const date = typeof input === "string" ? new Date(input) : input;
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("en", {
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}