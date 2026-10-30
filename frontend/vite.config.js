import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";

const vueTestUtils = fileURLToPath(
	new URL("./node_modules/@vue/test-utils/dist/vue-test-utils.esm-bundler.mjs", import.meta.url)
);

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: { "@vue/test-utils": vueTestUtils },
	},
	test: {
		environment: "jsdom",
		include: ["../calculator_app/public/js/calculator/**/*.test.js"],
	},
	server: {
		fs: { allow: [".."] },
	},
	base: "/assets/calculator_app/dist/",
	build: {
		outDir: "../calculator_app/public/dist",
		emptyOutDir: true,
		rollupOptions: {
			output: {
				entryFileNames: "calculator-bw-20261030.js",
				chunkFileNames: "chunks/[name].js",
				assetFileNames: (assetInfo) =>
					assetInfo.name?.endsWith(".css")
						? "calculator-bw-20261030.css"
						: "assets/[name][extname]",
			},
		},
	},
});
