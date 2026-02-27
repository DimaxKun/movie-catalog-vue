import { defineStore } from 'pinia';
import { reactive } from 'vue';
	import api from '../api';

export const useGlobalStore = defineStore('global',() => {
	let user = reactive({
		token: localStorage.getItem('token'),
		email: null,
		isAdmin: null,
		isLoading: false
	})

	async function getUserDetails(token){
	  	if(!token) {
			user.token = null;
		  	user.email = null;
        	user.isAdmin = null;

        	return;
    	}

		user.isLoading = true;
		try {
			let { data } = await api.get('/users/details');
			const profile = data.user || {};

			user.token = token;
			user.email = profile.email || null;
			user.isAdmin = profile.isAdmin || false;
		} catch (e) {
			localStorage.removeItem('token');
			user.token = null;
			user.email = null;
			user.isAdmin = null;
		} finally {
			user.isLoading = false;
		}

	}

	function logout(){
		localStorage.removeItem('token');
		user.token = null;
		user.email = null;
		user.isAdmin = null;
	}

	return {
		user,
		getUserDetails,
		logout
	}
})