<script setup>


import { watch, ref } from 'vue';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';
import api from '../api.js'

const email = ref('');
const password = ref('');
const confirmPass = ref("");
const isEnabled = ref(false);

const notyf = new Notyf();
const router = useRouter();


watch([email,password,confirmPass], (currentValue, oldValue) => {
        
        if(currentValue.every(input => input !== "") && currentValue[1] === currentValue[2]){
            isEnabled.value = true
        } else {
            isEnabled.value = false
        }
    });

async function handleSubmit() {
    try {
        let response = await api.post('/users/register', {
            email: email.value,
            password: password.value
        })

        if (response.status === 201) {
            notyf.success(response.data.message);

            email.value = "";
            password.value = "";
            confirmPass.value = "";

            router.push({ path: '/login' });
        } else {
            notyf.error("Registration Failed. Please contact administrator.");
        }
    } catch (e) {
        if (
            e.response.status === 404 ||
            e.response.status === 401 ||
            e.response.status === 400 ||
            e.response.status === 409
        ) {
            notyf.error(e.response.data.message);
        } else {
            console.error(e);
            notyf.error("Registration Failed. Please contact administrator.");
        }
    }
}


</script>

<template>
    <div class="container-fluid">
        <h1 class=" my-5 pt-3 text-center"> Register Page</h1>
        <div class="row d-flex justify-content-center">
            <div class="col col-md-5 border rounded-3  p-5">
                <form @submit.prevent="handleSubmit">
                    <div class="mb-3">
                        <label for="exampleInputEmail1" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                            v-model="email">
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputPassword1" class="form-label">Password</label>
                        <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
                    </div>
                    <div class="mb-3">
                        <label for="cpasswordInput" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="cpasswordInput" v-model="confirmPass" />
                    </div>
                    <div class="d-grid mt-5">
	                    <button type="submit" class="btn btn-primary btn-block" v-if="isEnabled">Submit</button>
	                    <button type="submit" class="btn btn-danger btn-block" disabled v-else>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>