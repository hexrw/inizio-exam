import presetWebFonts from "@unocss/preset-web-fonts"
import { presetWind3 } from "@unocss/preset-wind3"
import { defineConfig } from "unocss"

export default defineConfig({
    presets: [
        presetWind3(),
        presetWebFonts({
            provider: "google",
            fonts: {
                sans: "Inter:400,700",
                mono: "Fira Code:400,700",
            },
        }),
    ],
})
