<script setup>
    import{ computed } from 'vue';
    import { useGlobalStore } from '../stores/global';
    import { useRouter } from 'vue-router';
    import { Notyf } from 'notyf';

    const { user, logout } = useGlobalStore();
    const router = useRouter();
    const notyf = new Notyf();

    const displayEmail = computed(() => user.email || "");

    function handleLogout(){
        logout();
        notyf.success('Logged out successfully');
        router.push({ path: '/login' });
    }

</script>


<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container">
            <router-link to="/" class="navbar-brand app-logo">Movie Catalog</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav ms-auto gap-4">
                    <router-link to="/" class="nav-link" v-if="user.email && !user.isAdmin">Movies</router-link>
                    <router-link to="/admin" class="nav-link" v-if="user.email && user.isAdmin">Admin Dashboard</router-link>
                    <router-link :to="{ name: 'Register'}" class="nav-link  text-black" v-if="!user.email">Register</router-link>
                    <router-link :to="{ name: 'Login'}" class="nav-link text-primary" v-if="!user.email">Login</router-link>
                    <span class="navbar-text text-body-secondary" v-if="user.email">{{ displayEmail }}</span>
                    <a class="nav-link text-danger" href="#" @click.prevent="handleLogout" v-if="user.email">Logout</a>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.app-logo {
  font-weight: 700;
  text-decoration: none;
}
</style>