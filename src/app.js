import { onChange } from "./db.js";
import { renderMovieList } from "./components/movie-list.js";
import { renderMovieForm, showAddForm } from "./components/movie-form.js";
import { renderConnectionStatus } from "./components/connection-status.js";
import { renderDataTools } from "./components/data-tools.js";
import { renderToolbar } from "./components/toolbar.js";

export function initApp(listRoot, formRoot, statusRoot, toolsRoot, toolbarRoot, roomName) {
  const unsubStatus = renderConnectionStatus(statusRoot, roomName);

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
    onToggleWatched: (val) => {
      hideWatched = val;
      refresh();
    },
    initialHideWatched: false,
  });

  return () => {
    unsub();
    unsubStatus();
  };
}
