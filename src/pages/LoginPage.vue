<script setup>

import { useGlobalStore } from '../stores/global';
import { watch, ref } from 'vue';
import { Notyf } from 'notyf';

import api from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const { getUserDetails, user } = useGlobalStore();

const email = ref('');
const password = ref('');
const isEnabled = ref(false);

const notyf = new Notyf();

watch([email,password], (currentValue, oldValue) => {

if(currentValue.every(input => input !== "")){
    isEnabled.value = true
} else {
    isEnabled.value = false
}
});

async function handleSubmit(e) {

    e.preventDefault();

    try {
        let res = await api.post('/users/login', {
            email: email.value,
            password: password.value
        })

        console.log(res);

        if (res.data.access) {
            notyf.success('login successful');

            localStorage.setItem('token', res.data.access);

            getUserDetails(res.data.access);
            email.value = '';
            password.value = '';

            router.push({ path: '/' })
        }
    } catch (e) {


        if (
            e.response.status === 404 ||
            e.response.status === 401 ||
            e.response.status === 400
        ) {

            notyf.error(e.response.data.message);
        } else {

            console.error(e);
            notyf.error("Login Failed. Please contact administrator.");
        }

    }
}

</script>


<template>
    <div class="container-fluid">
        <h1 class=" my-5 pt-3 text-center"> Login Page</h1>
        <div class="row d-flex justify-content-center">
            <div class="col col-md-5 border rounded-3  p-5">
                <form v-on:submit="handleSubmit">
                    <div class="mb-3">
                        <label for="exampleInputEmail1" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                            v-model="email">
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputPassword1" class="form-label">Password</label>
                        <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
                    </div>
	                <div class="d-grid mt-5">
	                	<button type="submit" class="btn btn-primary btn-block"  v-if="isEnabled">Login</button>
                		<button type="submit" class="btn btn-danger btn-block" disabled v-else>Login</button>
	                </div>
                </form>
            </div>
        </div>
    </div>
</template>