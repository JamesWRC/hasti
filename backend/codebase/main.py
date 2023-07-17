from cachetools import TTLCache

from typing import List, Optional

from fastapi import FastAPI, HTTPException, Header, Body
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import HTMLResponse
from starlette.websockets import WebSocket, WebSocketDisconnect

import os
import json
AUTH_TOKEN = os.environ.get('AUTH_TOKEN')
MAX_SESSION_TIME = 300 # 5 minutes, max time in seconds a authentication session should last. (how much time the user has to sign the message with Metamask)
MAX_SESSIONS = 999999 # Max number of sessions until sessions will be kicked killed, that is, sessions that are less than MAX_SESSION_TIME old
app = FastAPI()

# Testing EB deployment
# app.add_middleware(
#     TrustedHostMiddleware, allowed_hosts=["tipcryp.to", "*.tipcryp.to", "localhost"] 
# )

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>

            var url = new URL(location.href);
            var otk = url.searchParams.get("otk");
            var ws = new WebSocket('wss://prod-dauth-backend.us-east-1.elasticbeanstalk.com/ws/' + otk);
            //var ws = new WebSocket('ws://localhost/ws/' + otk);
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@app.get("/")
async def get():
    return HTMLResponse(html)

# This class is used to notify the login page of the authentication result, using websockets
class Notifier:
    def __init__(self,otk):
        self.otk = otk
        self.connections: List[WebSocket] = []
        self.generator = self.get_notification_generator()
        self.numMessagesSent = 0

    def getNumMessagesSent(self):
        return self.numMessagesSent

    async def get_notification_generator(self):
        while True:
            message = yield
            await self._notify(message)

    async def push(self, msg: str):
        await self.generator.asend(msg)
        self.numMessagesSent+=1

    async def connect(self, websocket: WebSocket):
        await websocket.accept() 
        self.connections.append(websocket)

    def remove(self, websocket: WebSocket):
        self.connections.remove(websocket)

    async def _notify(self, message: str):
        living_connections = []
        while len(self.connections) > 0:
            # Looping like this is necessary in case a disconnection is handled
            # during await websocket.send_text(message)
            websocket = self.connections.pop()
            await websocket.send_text(message)
            living_connections.append(websocket)
        self.connections = living_connections



cache = TTLCache(maxsize=1, ttl=300)

#              www.example.com/ws/    (OTK) ONE TIME KEY 
# Example URL: www.example.com/ws/26842a36-b3ee-4809-ab6e-9a85c36af6ad
@app.websocket("/ws/{otk}")
async def websocket_endpoint(websocket: WebSocket, otk:str):
    await primeWebsocketConnection(otk)
    await cache.get(otk).connect(websocket)
    try:
        while True: 
            data = await websocket.receive_text() 
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        try:
            cache.get(otk).remove(websocket)
        except Exception as e:
            print("An error has occurred during handling ")
            print(e)


@app.post("/push/{otk}")
async def push_to_connected_websockets(otk:str, x_auth_token: Optional[str] = Header(None), payload: dict = Body(...)):
    if x_auth_token != AUTH_TOKEN:
        raise HTTPException(status_code=401, detail={'errorCode': 1002, 'message': 'x-auth-token is not provided or invalid.'})

    if cache.get(otk) is not None:
        try:
            print(payload)
            await cache[otk].push(json.dumps({'payload': payload}))
            return {"numMessages": cache.get(otk).getNumMessagesSent()}

        except Exception as e:
            print(" ERROR handling push body")
            print(e)
    else:
        raise HTTPException(status_code=400, detail={'errorCode': 1001, 'message': 'OTK for authentication session has expired or does not exist.', 'error': str(cache.keys())})

    # return {'success':True,'message':'Auth data was sent successfully'}

async def primeWebsocketConnection(otk:str):

    if cache.get(otk) is None:
        # raise HTTPException(status_code=400, detail="Authentication session using this OTK has already been primed.")
        cache[otk] = Notifier(otk)

        await cache.get(otk).generator.asend(None)