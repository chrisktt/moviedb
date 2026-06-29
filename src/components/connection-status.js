import { getPeers, onPeersChange } from "../sync.js";

export function renderConnectionStatus(root, roomName) {
  root.innerHTML = `
    <div class="connection-status">
      <span class="status-dot offline" id="cs-dot"></span>
      <span id="cs-label">Offline</span>
      <span class="room-name">Room: <code>${esc(roomName)}</code></span>
    </div>
  `;

  function update() {
    const count = getPeers();
    const dot = document.getElementById("cs-dot");
    const label = document.getElementById("cs-label");
    if (count > 1) {
      dot.className = "status-dot online";
      label.textContent = `${count} peer${count > 1 ? "s" : ""} connected`;
    } else {
      dot.className = "status-dot offline";
      label.textContent = "No peers — open on another device to sync";
    }
  }

  const unsub = onPeersChange(update);
  update();
  return unsub;
}

function esc(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
