import "./style.css";
import { whenReady } from "./db.js";
import { initApp } from "./app.js";

document.querySelector("#app").innerHTML = `
  <header>
    <h1>🎬 MovieDB</h1>
  </header>
  <main>
    <section id="toolbar-section"></section>
    <section id="movie-form-section"></section>
    <section id="movie-list-section"></section>
  </main>
  <section id="data-tools-section"></section>
  <footer>
    <p>Local-first · Sync via shared JSON file · Data stored in your browser</p>
  </footer>
`;

async function start() {
  await whenReady();

  initApp(
    document.getElementById("movie-list-section"),
    document.getElementById("movie-form-section"),
    document.getElementById("data-tools-section"),
    document.getElementById("toolbar-section")
  );
}

start();
