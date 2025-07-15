/**
 * Velocity Compression Worker (v3.2 - The Definitive Edition)
 *
 * Architecture: Wasm Initialization Gate.
 * This worker decouples Wasm initialization from task processing to eliminate race conditions.
 * It initializes itself once, signals readiness via a promise, and only then processes
 * the incoming message. This ensures absolute stability under concurrent load.
 */

// 1. Immediately load the Wasm glue code.
self.importScripts("./pngtiny.js");

// --- ARCHITECTURAL CONSTANTS ---
const TARGET_SIZE_BYTES = 512000;
const MAX_ITERATIONS = 10;
const MIN_COMPRESSION_GAIN_BYTES = 2048;

// 2. Create the "Ready Promise". This is the core of the fix.
//    We create a promise that will be resolved once the Wasm runtime is ready.
let wasmReady = new Promise((resolve) => {
	// Assign the resolver function to the onRuntimeInitialized hook.
	// This will be called by pngtiny.js when it's done compiling.
	pngtiny.onRuntimeInitialized = () => {
		// console.log("Wasm Runtime Initialized in Worker.");
		resolve();
	};
});

// 3. Immediately start the Wasm initialization.
pngtiny.run();

/**
 * Main message handler for the worker. Now an ASYNC function.
 * This is the entry point for tasks sent from the main thread.
 */
self.onmessage = async (e) => {
	try {
		// 4. AWAIT THE GATE. The handler will pause here until the wasmReady promise is resolved.
		//    This guarantees that the pngtiny module is fully operational before we proceed.
		await wasmReady;

		const { file } = e.data;

		// Use the modern, promise-based file.arrayBuffer() for cleaner code.
		const initialData = new Uint8Array(await file.arrayBuffer());

		let currentData = initialData;
		let lastSize = file.size;
		let iteration = 0;

		// --- The Compression Loop (Now safe to run) ---
		while (iteration < MAX_ITERATIONS) {
			const currentSize = currentData.byteLength;

			if (currentSize <= TARGET_SIZE_BYTES) {
				const status =
					iteration === 0 ? "无需压缩" : `完成 (${iteration}次)`;
				postResult(
					`<span class="status--success">${status}</span>`,
					currentData
				);
				return;
			}
			if (
				iteration > 0 &&
				lastSize - currentSize < MIN_COMPRESSION_GAIN_BYTES
			) {
				postResult(
					`<span class="status--warn">完成: 收益过低</span>`,
					currentData
				);
				return;
			}

			self.postMessage({
				type: "UPDATE",
				payload: {
					status: `压缩中 (${iteration + 1}/${MAX_ITERATIONS})...`,
				},
			});

			const result = performCompressionCycle(currentData);

			if (result.newData) {
				lastSize = currentSize;
				currentData = result.newData;
			} else {
				const reason = result.newSize === -1 ? "引擎错误" : "无法压缩";
				postResult(
					`<span class="status--error">失败: ${reason}</span>`,
					currentData
				);
				return;
			}
			iteration++;
		}

		postResult(
			`<span class="status--error">失败: 已达上限</span>`,
			currentData
		);
	} catch (error) {
		console.error("A fatal error occurred in the worker:", error);
		postResult(
			`<span class="status--error">致命错误</span>`,
			new Uint8Array()
		);
	}
};

/**
 * Sends the final result payload to the main thread.
 * @param {string} statusHTML - The final status HTML.
 * @param {Uint8Array} data - The compressed image data.
 */
function postResult(statusHTML, data) {
	const finalSize = data.byteLength;
	self.postMessage(
		{
			type: "COMPLETE",
			payload: { statusHTML, finalSize, data },
		},
		[data.buffer]
	);
}

/**
 * The core compression logic. It now uses .slice() to create a transferable copy.
 * @param {Uint8Array} data - The image data to compress.
 * @returns {{newData: Uint8Array | null, newSize: number}}
 */
function performCompressionCycle(data) {
	const currentSize = data.byteLength;
	let dataptr = 0,
		retdataptr = 0;
	try {
		dataptr = pngtiny._malloc(currentSize);
		retdataptr = pngtiny._malloc(4);
		if (dataptr === 0 || retdataptr === 0) {
			console.error("Worker Wasm _malloc failed.");
			return { newData: null, newSize: -1 };
		}

		pngtiny.HEAPU8.set(data, dataptr);
		pngtiny._tiny(dataptr, currentSize, retdataptr);

		const newSize = new Int32Array(pngtiny.HEAPU8.buffer, retdataptr, 1)[0];

		if (newSize > 0 && newSize < currentSize) {
			const wasmHeapView = new Uint8Array(
				pngtiny.HEAPU8.buffer,
				dataptr,
				newSize
			);
			const newData = wasmHeapView.slice();
			return { newData, newSize };
		} else {
			return { newData: null, newSize: newSize };
		}
	} catch (err) {
		console.error("Worker Wasm error:", err);
		return { newData: null, newSize: -1 };
	} finally {
		if (dataptr) pngtiny._free(dataptr);
		if (retdataptr) pngtiny._free(retdataptr);
	}
}
