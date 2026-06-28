import { getAllMovies, deleteMovie, updateMovie } from "../db.js";
import { showEditForm } from "./movie-form.js";

let container;

export function renderMovieList(root) {
  container = root;
  container.innerHTML = '<div class="movie-list"></div>';
  const list = container.querySelector(".movie-list");
  const movies = getAllMovies();

  if (movies.length === 0) {
    list.innerHTML =
      '<p class="empty-state">No movies yet. Add one below.</p>';
    return;
  }

  list.innerHTML = movies
    .map(
      (m) => `
    <div class="movie-card" data-id="${m.id}">
      <div class="movie-info">
        <h3>${esc(m.title)}${m.year ? ` <span class="year">(${m.year})</span>` : ""}</h3>
        ${m.director ? `<p class="director">${esc(m.director)}</p>` : ""}
        <span class="status status-${m.status || "none"}">${statusLabel(m.status)}</span>
        ${m.rating ? `<span class="rating">★ ${m.rating}/10</span>` : ""}
        ${m.notes ? `<p class="notes">${esc(m.notes)}</p>` : ""}
      </div>
      <div class="movie-actions">
        <button class="btn-icon edit-btn" data-id="${m.id}" title="Edit">✎</button>
        <button class="btn-icon del-btn" data-id="${m.id}" title="Delete">✕</button>
      </div>
    </div>`
    )
    .join("");

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
        deleteMovie(btn.dataset.id);
      }
    });
  });
}

function statusLabel(s) {
  const map = { watchlist: "📋 Watchlist", watching: "👀 Watching", watched: "✅ Watched" };
  return map[s] || "Uncategorized";
}

function esc(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
