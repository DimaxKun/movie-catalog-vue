import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import 'notyf/notyf.min.css';
import './assets/main.css';

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia';

import RegisterPage from './pages/RegisterPage.vue';
import LoginPage from './pages/LoginPage.vue'
import MovieCatalog from "./pages/MovieCatalog.vue";
import MovieDetaill from "./pages/MovieDetaill.vue";
import AdminDashboard from "./pages/AdminDashboard.vue";

import { createRouter, createWebHistory } from 'vue-router';

function decodeJwtPayload(token) {
    try {
        const payloadPart = token.split(".")[1];
        if (!payloadPart) return null;
        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: MovieCatalog,
            // meta: { requiresAuth: true }
        },
        {
            path: '/register',
            name: 'Register',
            component: RegisterPage
        },
        {
            path: '/login',
            name: 'Login',
            component: LoginPage
        },
        {
            path: '/movies/:id',
            name: 'MovieDetails',
            component: MovieDetaill
        },
        {
            path: '/admin',
            name: 'AdminDashboard',
            component: AdminDashboard,
            meta: { requiresAuth: true, requiresAdmin: true }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const jwtPayload = token ? decodeJwtPayload(token) : null;
    const isAdmin = Boolean(jwtPayload?.isAdmin);

    if (to.meta.requiresAuth && !token) {
        next({ path: '/login', query: { redirect: to.fullPath } });
    } else if (to.meta.requiresAdmin && !isAdmin) {
        next({ path: '/' });
    } else if (to.path === '/' && isAdmin) {
        next({ path: '/admin' });
    } else {
        next();
    }
});

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
