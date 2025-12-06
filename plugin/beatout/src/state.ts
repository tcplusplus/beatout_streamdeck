// @ts-ignore
import WebSocket from "ws";
import { WebSocketServer } from 'ws';

type IdCallback = (id: string) => void
type ToggleCallback = (enabled: boolean) => void

export class State {
    server: WebSocketServer
    selectedCamera: string = ''
    cameraSelectorEnabled: boolean = false

    private updateCameraCallbacks: IdCallback[] = []
    private updateCameraToggleCallbacks: ToggleCallback[] = []
    private clients: (WebSocket)[] = []

    constructor () {
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
        if (data.selectedCamera !== undefined && this.selectedCamera !== data.selectedCamera) {
            this.selectedCamera = data.selectedCamera
            this.updateCameraCallbacks.forEach(callback => callback(this.selectedCamera))
        }
        if (data.cameraToggle !== undefined) {
            this.cameraSelectorEnabled = data.cameraToggle
            this.updateCameraToggleCallbacks.forEach(callback => callback(this.cameraSelectorEnabled))
        }
    }

    registerSelectedCamera (callback: IdCallback) {
        this.updateCameraCallbacks.push(callback)
    }

    registerToggleCamera (callback: ToggleCallback) {
        this.updateCameraToggleCallbacks.push(callback)
    }

    switchCamera (cameraId: string) {
        const data = {action: "camera", id: cameraId}
        const message = JSON.stringify(data)    
        this.sendToAllClients(message)
    }

    setCameraToggle (toggleEnabled: boolean) {
        const data = {action: "cameraToggle", enabled: toggleEnabled}
        const message = JSON.stringify(data)    
        this.sendToAllClients(message)
    }

    private sendToAllClients(message: string) {
        this.clients.forEach(client => {
            client.send(message)
        });
    }
}
