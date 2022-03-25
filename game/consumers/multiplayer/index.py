from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
   
    async def connect(self):  
        await self.accept()
      

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self,data):
        #create rooms when create player
        self.room_name = None

        #identify if myself
       # start = 0
       # if data['username'] != "gj2":
       #     start = 100000

        for i in range(0, 10000):
            name = "room-%d" % (i)#room's name
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        #if no space room- do not accept request
        if not self.room_name:
            return
        
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
                'type' : "group_send_event",#this function woll send this message to all players in this group, the receive function name is type's value
                'event': "create_player",
                'uuid' : data['uuid'],
                'username' : data['username'],
                'photo' : data['photo'],
            }
        )

    async def group_send_event(self,data):
        await self.send(text_data=json.dumps(data))


    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "move_to",
                'uuid': data['uuid'],
                'tx' : data['tx'],
                'ty' : data['ty'],
            }
        )


    async def shoot_fireball(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event': "shoot_fireball",
                'uuid' : data['uuid'],
                'tx'   : data['tx'],
                'ty'   : data['ty'],
                'ball_uuid' : data['ball_uuid'],
            }
        )


    async def attack(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event': "attack",
                'uuid' : data['uuid'],
                'attackee_uuid':data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle':data['angle'],
                'damage': data['damage'],
                'ball_uuid':data['ball_uuid'],
            }
        )

    async def blink(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type' : "group_send_event",
                    'event' : "blink",
                    'uuid' : data['uuid'],
                    'tx' : data['tx'],
                    'ty' : data['ty'],
                }

        )


    async def message(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event': "message",
                'uuid' : data['uuid'],
                'text' : data['text'],

            }
        )

            #receive message from the front end
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)

