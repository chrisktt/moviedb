import { getAllMovies, addMovie } from "../db.js";

export function renderDataTools(root) {
  root.innerHTML = `
    <div class="data-tools">
      <button class="btn-secondary" id="dt-export">Export</button>
      <button class="btn-secondary" id="dt-import">Import</button>
      <input type="file" id="dt-file" accept=".json" style="display:none">
    </div>
  `;

  root.querySelector("#dt-export").addEventListener("click", () => {
    const movies = getAllMovies();
    const blob = new Blob([JSON.stringify(movies, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moviedb-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = root.querySelector("#dt-file");
  root.querySelector("#dt-import").addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let movies;
      try {
        movies = JSON.parse(reader.result);
        if (!Array.isArray(movies)) throw new Error("Not an array");
      } catch (e) {
        alert("Import failed: " + e.message);
        return;
      }
      setTimeout(() => {
        let count = 0;
        for (const item of movies) {
          if (!item.title) continue;
          addMovie({
            title: item.title,
            year: item.year,
            director: item.director,
            status: item.status,
            rating: item.rating,
            notes: item.notes,
          });
          count++;
        }
        alert(`Imported ${count} movie${count !== 1 ? "s" : ""}.`);
      }, 0);
    };
    reader.readAsText(file);
    fileInput.value = "";
  });
}
