import "./style.css";
import { whenReady } from "./db.js";
import { connect } from "./sync.js";
import { initApp } from "./app.js";

const ROOM_NAME = "moviedb-default";

document.querySelector("#app").innerHTML = `
  <header>
    <h1>🎬 MovieDB</h1>
    <div id="status-bar"></div>
  </header>
  <main>
    <section id="movie-list-section"></section>
    <section id="movie-form-section"></section>
  </main>
  <section id="data-tools-section"></section>
  <footer>
    <p>Local-first · P2P sync via WebRTC · Data stored in your browser</p>
  </footer>
`;

async function start() {
  await whenReady();
  connect(ROOM_NAME);

  initApp(
    document.getElementById("movie-list-section"),
    document.getElementById("movie-form-section"),
    document.getElementById("status-bar"),
    document.getElementById("data-tools-section"),
    ROOM_NAME
  );
}

start();
