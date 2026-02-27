<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import api from "../api";

const router = useRouter();
const notyf = new Notyf();

const isLoading = ref(false);
const movies = ref([]);

function placeholderSrc(title) {
  const text = title || "Movie";
  return "https://placehold.co/600x400/6f42c1/ffffff?font=lora&text=" + encodeURIComponent(text);
}

async function fetchMovies() {
  isLoading.value = true;
  try {
    const { data } = await api.get("/movies/getMovies");
    movies.value = data.movies || [];
  } catch (e) {
    if (e?.response?.status === 404) {
      movies.value = [];
    } else if (e?.response?.status === 403) {
      notyf.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push({ path: "/login" });
    } else {
      notyf.error("Failed to load movies.");
      console.error(e);
    }
  } finally {
    isLoading.value = false;
  }
}

function viewMovie(movieId) {
  router.push({ name: "MovieDetails", params: { id: movieId } });
}

onMounted(fetchMovies);
</script>

<template>
  <div class="container py-4 mt-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="m-0">Movies</h2>
      <button class="btn btn-outline-success" @click="fetchMovies" :disabled="isLoading">
        Refresh
      </button>
    </div>

    <div v-if="isLoading" class="alert alert-info">Loading movies…</div>

    <div v-else-if="movies.length === 0" class="alert alert-warning">
      No movies found.
    </div>

    <div v-else class="row g-5">
      <div class="col-12 col-sm-6 col-lg-4" v-for="movie in movies" :key="movie._id">
        <div class="card h-100 shadow-sm">
          <img class="card-img-top" :src="placeholderSrc(movie.title)" :alt="movie.title" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-2">{{ movie.title }}</h5>
            <div class=" mb-1">
              <div><strong>Director:</strong> {{ movie.director }}</div>
              <div><strong>Year:</strong> {{ movie.year }}</div>
              <div><strong>Genre:</strong> {{ movie.genre }}</div>
            </div>

            <p class="card-text flex-grow-1">
              <strong>Description:</strong> {{ movie.description }}
            </p>

            <div class="d-grid mt-2">
              <button class="btn btn-primary" @click="viewMovie(movie._id)">
                View Movie
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>