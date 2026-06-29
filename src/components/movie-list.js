import { getAllMovies, deleteMovie, updateMovie } from "../db.js";
import { showEditForm } from "./movie-form.js";

let container;
const expandedIds = new Set();
let currentHideWatched = false;

export function renderMovieList(root, hideWatched) {
  container = root;
  currentHideWatched = hideWatched ?? false;
  container.innerHTML = '<div class="movie-list"></div>';
  const list = container.querySelector(".movie-list");
  let movies = getAllMovies();

  if (hideWatched) {
    movies = movies.filter((m) => !m.watchedAt);
  }

  if (movies.length === 0) {
    list.innerHTML =
      `<p class="empty-state">${hideWatched ? "No unwatched movies." : "No movies yet."}</p>`;
    return;
  }

  list.innerHTML = movies
    .map(
      (m) => `
    <div class="movie-card${expandedIds.has(m.id) ? " expanded" : ""}" data-id="${m.id}">
      <div class="movie-row">
        <span class="mc-title">${esc(m.title)}${m.year ? ` <span class="mc-year">(${m.year})</span>` : ""}</span>
        <span class="mc-watched">${m.watchedAt ? "📅" : ""}</span>
        <button class="chevron">${expandedIds.has(m.id) ? "▲" : "▼"}</button>
      </div>
      <div class="movie-detail">
        ${m.director ? `<p class="director">${esc(m.director)}</p>` : ""}
        ${m.notes ? `<p class="notes">${esc(m.notes)}</p>` : ""}
        ${m.rating ? `<p class="movie-rating">★ ${m.rating}/10</p>` : ""}
        ${m.watchedAt ? `<p class="watched-date">Watched ${m.watchedAt}</p>` : ""}
        <div class="movie-actions">
          <button class="btn-icon edit-btn" data-id="${m.id}" title="Edit">✎</button>
          <button class="btn-icon del-btn" data-id="${m.id}" title="Delete">✕</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  list.querySelectorAll(".chevron").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".movie-card");
      const id = card.dataset.id;
      if (expandedIds.has(id)) {
        expandedIds.delete(id);
      } else {
        expandedIds.add(id);
      }
      renderMovieList(container, currentHideWatched);
    });
  });

  list.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const movie = getAllMovies().find((m) => m.id === id);
      if (movie) showEditForm(movie);
    });
  });

  list.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Delete this movie?")) {
        expandedIds.delete(btn.dataset.id);
        deleteMovie(btn.dataset.id);
      }
    });
  });
}

function esc(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
