import { onChange } from "./db.js";
import { renderMovieList } from "./components/movie-list.js";
import { renderMovieForm } from "./components/movie-form.js";
import { renderConnectionStatus } from "./components/connection-status.js";
import { renderDataTools } from "./components/data-tools.js";

export function initApp(listRoot, formRoot, statusRoot, toolsRoot, roomName) {
  const unsubStatus = renderConnectionStatus(statusRoot, roomName);

  function refresh() {
    renderMovieList(listRoot);
  }

  const unsub = onChange(refresh);
  refresh();

  renderMovieForm(formRoot, listRoot);
  renderDataTools(toolsRoot);

  return () => {
    unsub();
    unsubStatus();
  };
}
