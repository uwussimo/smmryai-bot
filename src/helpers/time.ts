export type TimeArg =
	| { type: "count"; value: number }
	| { type: "since"; value: Date };

export function parseTimeArg(arg: string | undefined): TimeArg {
	if (!arg) return { type: "count", value: 50 };

	const now = new Date();

	if (arg === "today") {
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		return { type: "since", value: start };
	}
	if (arg === "yesterday") {
		const start = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() - 1,
		);
		return { type: "since", value: start };
	}

	const timeMatch = arg.match(/^(\d+)(m|h|d)$/i);
	if (timeMatch) {
		const amount = parseInt(timeMatch[1], 10);
		const unit = timeMatch[2].toLowerCase();
		const ms =
			unit === "m"
				? amount * 60_000
				: unit === "h"
					? amount * 3_600_000
					: amount * 86_400_000;
		return { type: "since", value: new Date(now.getTime() - ms) };
	}

	const count = parseInt(arg, 10);
	if (!isNaN(count) && count > 0) {
		return { type: "count", value: Math.min(count, 1000) };
	}

	return { type: "count", value: 50 };
}
