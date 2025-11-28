import asyncio
import json

import websockets

async def main():
    uri = "ws://localhost:20000"   # vervang door jouw serveradres
    data = {
        "selectedCamera": "a",
        "selectedRoom": "bla"
    }
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(data))
        while True:
            response = await websocket.recv()
            print("Server antwoord:", response)

asyncio.run(main())