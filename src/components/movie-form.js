import { addMovie, updateMovie, getAllMovies } from "../db.js";

let formRoot;
let editingId = null;
let formVisible = false;

export function renderMovieForm(root, listRoot) {
  formRoot = root;
  formRoot.innerHTML = "";
}

export function showAddForm() {
  editingId = null;
  formVisible = true;
  render();
}

export function showEditForm(movie) {
  editingId = movie.id;
  formVisible = true;
  render();
}

function render() {
  if (!formVisible) {
    formRoot.innerHTML = "";
    return;
  }

  const movie = editingId ? getAllMovies().find((m) => m.id === editingId) : null;

  formRoot.innerHTML = `
    <form id="movie-form" class="movie-form">
      <h3>${movie ? "Edit Movie" : "Add Movie"}</h3>
      <div class="form-row">
        <input type="text" id="mf-title" placeholder="Title *" required value="${movie?.title ? escAttr(movie.title) : ""}">
        <input type="number" id="mf-year" placeholder="Year" min="1888" max="2100" value="${movie?.year ?? ""}">
      </div>
      <input type="text" id="mf-director" placeholder="Director" value="${movie?.director ? escAttr(movie.director) : ""}">
      <div class="form-row">
        <input type="date" id="mf-watched-at" value="${movie?.watchedAt ?? ""}">
        <input type="number" id="mf-rating" placeholder="Rating (1-10)" min="1" max="10" value="${movie?.rating ?? ""}">
      </div>
      <textarea id="mf-notes" placeholder="Notes..." rows="2">${movie?.notes ? escAttr(movie.notes) : ""}</textarea>
      <div class="form-actions">
        <button type="submit" class="btn-primary">${movie ? "Update" : "Add Movie"}</button>
        <button type="button" id="mf-cancel" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

  const form = formRoot.querySelector("#movie-form");
  form.addEventListener("submit", handleSubmit);
  formRoot.querySelector("#mf-cancel").addEventListener("click", () => {
    editingId = null;
    formVisible = false;
    render();
  });
}

function handleSubmit(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById("mf-title").value.trim(),
    year: document.getElementById("mf-year").value ? Number(document.getElementById("mf-year").value) : undefined,
    director: document.getElementById("mf-director").value.trim() || undefined,
    watchedAt: document.getElementById("mf-watched-at").value || undefined,
    rating: document.getElementById("mf-rating").value ? Number(document.getElementById("mf-rating").value) : undefined,
    notes: document.getElementById("mf-notes").value.trim() || undefined,
  };

  if (!data.title) return;

  if (editingId) {
    updateMovie(editingId, data);
  } else {
    addMovie(data);
  }

  editingId = null;
  formVisible = false;
  render();
}

function escAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
