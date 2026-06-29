import { onChange } from "./db.js";
import { renderMovieList } from "./components/movie-list.js";
import { renderMovieForm, showAddForm } from "./components/movie-form.js";
import { renderDataTools, runSync } from "./components/data-tools.js";
import { renderToolbar } from "./components/toolbar.js";

export function initApp(listRoot, formRoot, toolsRoot, toolbarRoot) {
  let hideWatched = false;

  function refresh() {
    renderMovieList(listRoot, hideWatched);
  }

  const unsub = onChange(refresh);
  refresh();

  renderMovieForm(formRoot, listRoot);
  renderDataTools(toolsRoot);
  renderToolbar(toolbarRoot, {
    onAddMovie: showAddForm,
    onSync: runSync,
    onToggleWatched: (val) => {
      hideWatched = val;
      refresh();
    },
    initialHideWatched: false,
  });

  return unsub;
}
