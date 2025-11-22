import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { CameraSelector } from "./actions/cameraSelector";
// @ts-ignore
import WebSocket from "ws";
import ReconnectingWebSocket from "reconnecting-websocket";

const options = {
  WebSocket: WebSocket,   // <-- verplicht in Node.js
};

streamDeck.logger.setLevel(LogLevel.TRACE);

try {
    console.log('hello world')
    const ws = new ReconnectingWebSocket("ws://127.0.0.1:8000/ws", [], options);// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
    ws.addEventListener("open", () => {
        console.log("WS: OPEN");
    });
    ws.addEventListener("message", (ev) => {
        console.log("WS: MESSAGE", ev.data);
    });
    ws.addEventListener("error", (err) => {
        console.error("WS: ERROR", err);
    });
    ws.addEventListener("close", (ev) => {
        console.log("WS: CLOSE", ev.code, ev.reason);
    });

    // Register the increment action.
    streamDeck.actions.registerAction(new CameraSelector(ws));
} catch(e) {
    console.log('error', e)
}




// Finally, connect to the Stream Deck.
streamDeck.connect();
