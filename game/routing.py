from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer


#routings of WebSocket like urls in Http 
websocket_urlpatterns = [
        path("wss/multiplayer/", MultiPlayer.as_asgi(), name = "wss_multiplayer"),

]
