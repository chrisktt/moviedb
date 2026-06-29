import { getPeers, onPeersChange, getSignalingConnected, onSignalingChange } from "../sync.js";

export function renderConnectionStatus(root, roomName) {
  root.innerHTML = `
    <div class="connection-status">
      <span class="status-dot" id="cs-dot"></span>
      <span id="cs-label"></span>
      <span class="room-name">Room: <code>${esc(roomName)}</code></span>
    </div>
  `;

  function update() {
    const signalingUp = getSignalingConnected();
    const count = getPeers();
    const dot = document.getElementById("cs-dot");
    const label = document.getElementById("cs-label");

    if (!signalingUp) {
      dot.className = "status-dot connecting";
      label.textContent = "Connecting…";
    } else if (count > 1) {
      dot.className = "status-dot online";
      label.textContent = `${count} peer${count > 1 ? "s" : ""} connected`;
    } else {
      dot.className = "status-dot waiting";
      label.textContent = "Waiting for peers";
    }
  }

  const unsubPeers = onPeersChange(update);
  const unsubSignal = onSignalingChange(update);
  update();

  return () => {
    unsubPeers();
    unsubSignal();
  };
}

function esc(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
