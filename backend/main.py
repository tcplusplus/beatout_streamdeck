import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import logging
from pydantic import BaseModel

app = FastAPI()

class State(BaseModel):
    selectedCamera: str
    selectedRoom: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()
state = State(selectedRoom='', selectedCamera='')


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            text = await websocket.receive_text()
            try:
                print(text)
                data = json.loads(text)
                if data.get('action') == 'room' and 'id' in data:
                    state.selectedRom = data['id']
                if data.get('action') == 'camera' and 'id' in data:
                    state.selectedCamera = data['id']
                await manager.broadcast(state.model_dump_json())
            except Exception as error:
                logging.warning('Unknown message received: %r', error)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client disconnected.")

def main():
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000
        # reload=True  # reload werkt alleen in dev
    )

if __name__ == "__main__":
    main()