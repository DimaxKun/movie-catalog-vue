<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notyf } from "notyf";
import api from "../api";

const route = useRoute();
const router = useRouter();
const notyf = new Notyf();

const movieId = computed(() => route.params.id);

const isLoading = ref(false);
const movie = ref(null);

const isSubmitting = ref(false);
const newComment = ref("");

async function fetchMovie() {
  isLoading.value = true;
  try {
    const { data } = await api.get(`/movies/getMovie/${movieId.value}`);
    movie.value = data;
  } catch (e) {
    if (e?.response?.status === 404) {
      notyf.error("Movie not found.");
      router.push({ path: "/" });
    } else if (e?.response?.status === 403) {
      notyf.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push({ path: "/login" });
    } else {
      notyf.error("Failed to load movie details.");
      console.error(e);
    }
  } finally {
    isLoading.value = false;
  }
}

async function submitComment() {
  const commentText = newComment.value.trim();
  if (!commentText) return;

  const token = localStorage.getItem("token");
  if (!token) {
    notyf.error("Please login to add a comment.");
    router.push({ path: "/login", query: { redirect: `/movies/${movieId.value}` } });
    return;
  }

  isSubmitting.value = true;
  try {
    const { data } = await api.patch(`/movies/addComment/${movieId.value}`, {
      comment: commentText
    });
    notyf.success(data?.message || "Comment added.");
    newComment.value = "";
    movie.value = data?.updatedMovie || movie.value;
  } catch (e) {
    if (e?.response?.status === 403) {
      notyf.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push({ path: "/login" });
    } else {
      notyf.error("Failed to add comment.");
      console.error(e);
    }
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(fetchMovie);
</script>

<template>
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="m-0">Movie Details</h2>
    </div>

    <div v-if="isLoading" class="alert alert-info">Loading movie…</div>

    <div v-else-if="!movie" class="alert alert-warning">No movie loaded.</div>

    <div v-else class="row g-3">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-4">{{ movie.title }}</h3>
            <div class="text-dark mb-2">
              <div><strong>Director:</strong> {{ movie.director }}</div>
              <div><strong>Year:</strong> {{ movie.year }}</div>
              <div><strong>Genre:</strong> {{ movie.genre }}</div>
            </div>
            <p class="mb-0"><strong>Description:</strong> {{ movie.description }}</p>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-3">Comments</h5>

            <div v-if="!movie.comments || movie.comments.length === 0" class="alert alert-secondary mb-3">
              No comments yet.
            </div>

            <ul v-else class="list-group mb-3">
              <li class="list-group-item" v-for="(c, idx) in movie.comments" :key="c._id || idx">
                <div class="small text-body-tertiary" v-if="c.userId">
                  User: {{ c.userId }}
                </div>
                <div>{{ c.comment }}</div>
              </li>
            </ul>

            <form class="d-flex gap-2" @submit.prevent="submitComment">
              <input
                class="form-control"
                type="text"
                placeholder="Write a comment…"
                v-model="newComment"
                :disabled="isSubmitting"
              />
              <button class="btn btn-primary" type="submit" :disabled="isSubmitting || !newComment.trim()">
                Add
              </button>
            </form>
          </div>
        </div>
        <button class="btn btn-outline-success mt-4" @click="$router.push('/')" :disabled="isLoading">
        Back to catalog
      </button>
      </div>
    </div>
  </div>
</template>