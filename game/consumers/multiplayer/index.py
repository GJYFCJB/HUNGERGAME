from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        #assume at most 1000 rooms
        for i in range(1000):
            name = "room-%d" % (i)#room's name
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        #if no space room- do not accept request
        if not self.room_name:
            return

        await self.accept()
        
        #if is a new room -- create room
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) #Validity period 1h

        #send the existing player info to each client
        for player in cache.get(self.room_name):
            await self.send(text_data = json.dumps({
                'event':"create_player",
                'uuid':player['uuid'],
                'username':player['username'],
                'photo':player['photo'],
            }))


        #this function can send message to all in this room
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self,data):
        #find currnet game
        players = cache.get(self.room_name)
        players.append({
            'uuid':data['uuid'],
            'username':data['username'],
            'photo':data['photo'],
        })
        cache.set(self.room_name, players, 3600)#after create the last player the game will exists 1 hour
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_create_player",#this function woll send this message to all players in this group, the receive function name is type's value
                'event': "create_player",
                'uuid' : data['uuid'],
                'username' : data['username'],
                'photo' : data['photo'],
            }
        )

    async def group_create_player(self,data):
        await self.send(text_data=json.dumps(data))




    #receive message from the front end
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        

