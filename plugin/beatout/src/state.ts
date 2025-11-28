// @ts-ignore
import WebSocket from "ws";
import { WebSocketServer } from 'ws';
import ReconnectingWebSocket from "reconnecting-websocket";

const options = {
  WebSocket: WebSocket,   // <-- verplicht in Node.js
};

type IdCallback = (id: string) => void


export class State {
    client: ReconnectingWebSocket
    server: WebSocketServer
    selectedRoom: string = ''
    selectedCamera: string = ''

    private updateRoomCallbacks: IdCallback[] = []
    private updateCameraCallbacks: IdCallback[] = []
    private clients: (WebSocket|ReconnectingWebSocket)[] = []

    constructor () {
        this.client = new ReconnectingWebSocket("ws://127.0.0.1:8000/ws", [], options);// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
        this.client.addEventListener("open", () => {
            console.log("WS: OPEN");
        });
        this.client.addEventListener("message", (ev) => {
            this.processMessage(ev.data);
        });
        this.client.addEventListener("error", (err) => {
            console.error("WS: ERROR", err);
        });
        this.client.addEventListener("close", (ev) => {
            console.log("WS: CLOSE", ev.code, ev.reason);
        });
        this.clients.push(this.client)

        this.server = new WebSocketServer({ port: 20000 });
        this.server.on('connection', (ws) => {
            this.clients.push(ws)
            console.log('Client connected');
            ws.on('message', (message) => {
                this.processMessage(message.toString());
            });
            ws.on("close", () => {
                this.clients = this.clients.filter(client => client !== ws)
            })
            ws.send(JSON.stringify({"action": "welcome"}));
        });
    }

    private processMessage (message: string) {
        console.log("text", message)
        const data = JSON.parse(message)
        if (this.selectedCamera !== data.selectedCamera) {
            this.selectedCamera = data.selectedCamera
            this.updateCameraCallbacks.forEach(callback => callback(this.selectedCamera))
        }
        if (this.selectedRoom !== data.selectedRoom) {
            this.selectedRoom = data.selectedRoom
            this.updateRoomCallbacks.forEach(callback => callback(this.selectedRoom))
        }
    }

    registerSelectedCamera (callback: IdCallback) {
        this.updateCameraCallbacks.push(callback)
    }

    registerSelectedRoom (callback: IdCallback) {
        this.updateRoomCallbacks.push(callback)
    }

    switchCamera (cameraId: string) {
        const data = {action: "camera", id: cameraId}
        const message = JSON.stringify(data)    
        this.sendToAllClients(message)
    }

    private sendToAllClients(message: string) {
        this.clients.forEach(client => {
            client.send(message)
        });
    }
}
