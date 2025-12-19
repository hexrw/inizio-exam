import "@unocss/reset/tailwind.css"
import "virtual:uno.css"

import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"
import HomeView from "./components/HomeView.vue"
import i18n from "./i18n"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
    ],
})

export default router

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount("#app")
