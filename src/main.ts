import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app/App.vue'
import { routes } from './app/router'
import './app/theme.css'
import './app/branding.css'
import faviconUrl from './public/icons/udev_icon_circle_192px.png'

const favicon = document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/png'
favicon.href = faviconUrl
document.head.append(favicon)

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
