import { getAllMovies, mergeMovies } from "../db.js";

let syncInput;
let importInput;

export function renderDataTools(root) {
  root.innerHTML = `
    <div class="data-tools">
      <button class="btn-secondary" id="dt-export">Export</button>
      <button class="btn-secondary" id="dt-import">Import</button>
      <input type="file" id="dt-import-file" accept=".json" style="display:none">
      <input type="file" id="dt-sync-file" accept=".json" style="display:none">
    </div>
  `;

  importInput = root.querySelector("#dt-import-file");
  syncInput = root.querySelector("#dt-sync-file");

  root.querySelector("#dt-export").addEventListener("click", () => {
    download(`moviedb-${new Date().toISOString().slice(0, 10)}.json`);
  });

  root.querySelector("#dt-import").addEventListener("click", () => {
    importInput.click();
  });

  importInput.addEventListener("change", () => {
    const file = importInput.files[0];
    if (!file) return;
    readFile(file, (movies) => {
      const result = mergeMovies(movies);
      alert(`Imported ${result.added} new, updated ${result.merged}.`);
    });
    importInput.value = "";
  });

  syncInput.addEventListener("change", () => {
    const file = syncInput.files[0];
    if (!file) return;
    readFile(file, (movies) => {
      const result = mergeMovies(movies);
      download("moviedb.json");
      const parts = [];
      if (result.added) parts.push(`${result.added} new`);
      if (result.merged) parts.push(`${result.merged} updated`);
      const summary = parts.length ? parts.join(", ") : "Already up to date";
      alert(`Sync complete — ${summary}.\n\nReplace the file in your shared folder with the downloaded moviedb.json.`);
    });
    syncInput.value = "";
  });
}

export function runSync() {
  if (syncInput) syncInput.click();
}

function download(filename) {
  const movies = getAllMovies();
  const blob = new Blob([JSON.stringify(movies, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function readFile(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    let movies;
    try {
      movies = JSON.parse(reader.result);
      if (!Array.isArray(movies)) throw new Error("Not an array");
    } catch (e) {
      alert("Invalid file: " + e.message);
      return;
    }
    setTimeout(() => callback(movies), 0);
  };
  reader.readAsText(file);
}
