/// <reference types="vitest/config" />

import { fileURLToPath, URL } from "node:url"
import { cloudflare } from "@cloudflare/vite-plugin"
import vue from "@vitejs/plugin-vue"
import UnoCSS from "unocss/vite"
import { defineConfig } from "vite"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        vue(),
        vueDevTools(),
        UnoCSS(),
        // Only include cloudflare plugin when not running tests
        mode !== "test" && cloudflare(),
    ].filter(Boolean),
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
        port: 4005,
    },
    test: {
        globals: true,
        environment: "node",
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
}))
