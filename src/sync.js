import { WebrtcProvider } from "y-webrtc";
import { ydoc } from "./db.js";

let webrtcProvider = null;

const SIGNALING_SERVERS = [
  "wss://signaling.yjs.dev",
  "wss://y-webrtc-signaling-eu.herokuapp.com",
  "wss://y-webrtc-signaling-us.herokuapp.com",
];

export function connect(roomName = "moviedb-default") {
  if (webrtcProvider) return webrtcProvider;

  webrtcProvider = new WebrtcProvider(roomName, ydoc, {
    signaling: SIGNALING_SERVERS,
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

export function getSignalingConnected() {
  if (!webrtcProvider || !webrtcProvider.signalingConns) return false;
  return webrtcProvider.signalingConns.some((c) => c.wsconnected);
}

export function onSignalingChange(callback) {
  if (!webrtcProvider) return () => {};
  const unsubs = webrtcProvider.signalingConns.map((conn) => {
    const handler = () => callback(getSignalingConnected());
    conn.on("connect", handler);
    conn.on("disconnect", handler);
    return () => {
      conn.off("connect", handler);
      conn.off("disconnect", handler);
    };
  });
  return () => unsubs.forEach((u) => u());
}

export { webrtcProvider };
