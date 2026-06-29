import { WebrtcProvider } from "y-webrtc";
import { ydoc } from "./db.js";

let webrtcProvider = null;

export function connect(roomName = "moviedb-default") {
  if (webrtcProvider) return webrtcProvider;

  webrtcProvider = new WebrtcProvider(roomName, ydoc, {
    signaling: ["wss://signaling.yjs.dev"],
    peerOpts: {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    },
  });

  return webrtcProvider;
}

export function disconnect() {
  if (webrtcProvider) {
    webrtcProvider.disconnect();
    webrtcProvider.destroy();
    webrtcProvider = null;
  }
}

export function getPeers() {
  if (!webrtcProvider) return 1;
  return webrtcProvider.awareness.getStates().size;
}

export function onPeersChange(callback) {
  if (!webrtcProvider) return () => {};
  const handler = () => {
    callback(webrtcProvider.awareness.getStates().size);
  };
  webrtcProvider.awareness.on("change", handler);
  return () => webrtcProvider.awareness.off("change", handler);
}

export { webrtcProvider };
