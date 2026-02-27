<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import api from "../api";
import { Modal } from "bootstrap";

const router = useRouter();
const notyf = new Notyf();

const isLoading = ref(false);
const movies = ref([]);

const mode = ref("add");
const workingId = ref(null);

const form = ref({
  title: "",
  director: "",
  year: "",
  description: "",
  genre: ""
});

const modalTitle = computed(() => (mode.value === "add" ? "Add Movie" : "Update Movie"));

function resetForm() {
  form.value = {
    title: "",
    director: "",
    year: "",
    description: "",
    genre: ""
  };
  workingId.value = null;
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
      notyf.error("Action forbidden or session expired.");
      router.push({ path: "/" });
    } else {
      notyf.error("Failed to load movies.");
      console.error(e);
    }
  } finally {
    isLoading.value = false;
  }
}

function openAddModal() {
  mode.value = "add";
  resetForm();
}

function openEditModal(movie) {
  mode.value = "edit";
  workingId.value = movie._id;
  form.value = {
    title: movie.title || "",
    director: movie.director || "",
    year: movie.year ?? "",
    description: movie.description || "",
    genre: movie.genre || ""
  };
}

const isSaving = ref(false);
async function saveMovie() {
  isSaving.value = true;
  try {
    const payload = {
      title: form.value.title,
      director: form.value.director,
      year: Number(form.value.year),
      description: form.value.description,
      genre: form.value.genre
    };

    if (mode.value === "add") {
      await api.post("/movies/addMovie", payload);
      notyf.success("Movie added.");
    } else {
      await api.patch(`/movies/updateMovie/${workingId.value}`, payload);
      notyf.success("Movie updated.");
    }

    await fetchMovies();
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data?.error?.message;
    if (e?.response?.status === 409) {
      notyf.error(msg || "Movie already exists.");
    } else if (e?.response?.status === 403) {
      notyf.error("Action forbidden.");
    } else {
      notyf.error("Failed to save movie.");
      console.error(e);
    }
  } finally {
    isSaving.value = false;
  }
}

const isDeleting = ref(false);
async function deleteMovie(movieId) {
  if (!confirm("Delete this movie?")) return;

  isDeleting.value = true;
  try {
    await api.delete(`/movies/deleteMovie/${movieId}`);
    notyf.success("Movie deleted.");
    await fetchMovies();
  } catch (e) {
    if (e?.response?.status === 403) {
      notyf.error("Action forbidden.");
    } else {
      notyf.error("Failed to delete movie.");
      console.error(e);
    }
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  fetchMovies();
});
</script>

<template>
  <div class="container py-4 mt-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h2 class="m-0">Admin Dashboard</h2>
        <div class=" text-body-tertiary small mt-2">Manage movie catalog</div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-success" @click="fetchMovies" :disabled="isLoading">
          Refresh
        </button>

        <button id="addMovie" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#movieModal"
          @click="openAddModal">
          Add Movie
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="alert alert-info">Loading movies…</div>

    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table align-middle table-hover mb-0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Director</th>
              <th>Year</th>
              <th>Description</th>
              <th>Genre</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="movies.length === 0">
              <td colspan="6" class="text-center text-body-secondary py-4">No movies found.</td>
            </tr>
            <tr v-for="m in movies" :key="m._id">
              <td class="fw-semibold">{{ m.title }}</td>
              <td>{{ m.director }}</td>
              <td>{{ m.year }}</td>
              <td style="min-width: 320px;">
                <div class="text-truncate" style="max-width: 520px;">{{ m.description }}</div>
              </td>
              <td>{{ m.genre }}</td>
              <td class="text-end" style="white-space: nowrap;">
                <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#movieModal"
                  @click="openEditModal(m)">
                  Update
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteMovie(m._id)" :disabled="isDeleting">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal fade" id="movieModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="saveMovie">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Title</label>
                  <input class="form-control" v-model="form.title" required />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Director</label>
                  <input class="form-control" v-model="form.director" required />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label">Year</label>
                  <input class="form-control" type="number" v-model="form.year" required min="1800" />
                </div>
                <div class="col-12 col-md-8">
                  <label class="form-label">Genre</label>
                  <input class="form-control" v-model="form.genre" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" rows="4" v-model="form.description" required />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="isSaving">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSaving" data-bs-dismiss="modal">
                {{ mode === "add" ? "Add" : "Update" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>