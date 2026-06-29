let toolbarRoot = null;
let onAddMovie = null;
let onToggleWatched = null;
let hideWatched = false;

export function renderToolbar(root, callbacks) {
  toolbarRoot = root;
  onAddMovie = callbacks.onAddMovie;
  onToggleWatched = callbacks.onToggleWatched;
  hideWatched = callbacks.initialHideWatched ?? false;
  render();
}

function render() {
  toolbarRoot.innerHTML = `
    <div class="toolbar">
      <button class="btn-primary" id="tb-add">+ Add Movie</button>
      <button class="btn-secondary" id="tb-toggle-watched">${hideWatched ? "👁 Show watched" : "👁 Hide watched"}</button>
    </div>
  `;

  toolbarRoot.querySelector("#tb-add").addEventListener("click", () => {
    if (onAddMovie) onAddMovie();
  });

  toolbarRoot.querySelector("#tb-toggle-watched").addEventListener("click", () => {
    hideWatched = !hideWatched;
    render();
    if (onToggleWatched) onToggleWatched(hideWatched);
  });
}

export function getHideWatched() {
  return hideWatched;
}
