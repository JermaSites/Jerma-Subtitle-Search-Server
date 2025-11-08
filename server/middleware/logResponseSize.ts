import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
	if (!event.path?.startsWith('/search')) {
		return;
	}

	const originalEnd = event.node.res.end;

	event.node.res.end = function (chunk?: any, ...args: any[]) {
		if (chunk) {
			const size = Buffer.byteLength(chunk);

			if (size < 1024 * 1024) {
				console.log(`Response size: ${(size / 1024).toFixed(2)} KiB`);
			} else {
				console.log(`Response size: ${(size / 1024 ** 2).toFixed(2)} MiB`);
			}
		}
		return originalEnd.call(this, chunk, ...(args as [any]));
	};
});
