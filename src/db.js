import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

export const ydoc = new Y.Doc();

const indexeddbProvider = new IndexeddbPersistence("moviedb", ydoc);

const movieMap = ydoc.getMap("movies");

export function getMovie(id) {
  const raw = movieMap.get(id);
  return raw ? { id, ...JSON.parse(raw) } : undefined;
}

export function getAllMovies() {
  const movies = [];
  movieMap.forEach((value, id) => {
    movies.push({ id, ...JSON.parse(value) });
  });
  movies.sort((a, b) => a.addedAt - b.addedAt);
  return movies;
}

export function addMovie(movie) {
  const id = crypto.randomUUID();
  const now = Date.now();
  const entry = { ...movie, addedAt: now, updatedAt: now };
  movieMap.set(id, JSON.stringify(entry));
  return { id, ...entry };
}

export function updateMovie(id, patch) {
  const existing = getMovie(id);
  if (!existing) return;
  const updated = { ...existing, ...patch, updatedAt: Date.now() };
  movieMap.set(id, JSON.stringify(updated));
  return updated;
}

export function deleteMovie(id) {
  movieMap.delete(id);
}

export function onChange(callback) {
  function handler() {
    callback(getAllMovies());
  }
  movieMap.observe(handler);
  return () => movieMap.unobserve(handler);
}

export function whenReady() {
  return new Promise((resolve) => {
    if (indexeddbProvider.synced) {
      resolve();
    } else {
      indexeddbProvider.on("synced", () => resolve());
    }
  });
}

export function destroy() {
  indexeddbProvider.destroy();
  ydoc.destroy();
}
