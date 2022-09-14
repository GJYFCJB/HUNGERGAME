class MultiPlayerSocket{
        constructor(playground){
            
            this.playground = playground;
            
            //must be same as game.rouuting.py's route
            this.ws = new WebSocket("wss://hungerplay.com/wss/multiplayer/");
            
            this.start();

        }

    start(){
        this.receive();
    }

    //since we have sent from backend we should have receive method from front end
    receive(){

        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            //if is me del
            if(uuid === outer.uuid) return false;

            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(uuid,data.username,data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(uuid,data.tx,data.ty);
            }else if(event === "attack"){
                outer.receive_attack(uuid,data.attackee_uuid,data.x,data.y,data.angle,data.damage,data.ball_uuid);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }else if(event === "blink"){
                outer.receive_blink(uuid,data.tx,data.ty);
            }else if(event === "message"){
                outer.receive_message(uuid,data.text);
            }
        }
    }
    //need two functions when player created need send to server and server need send to other client

    send_create_player(username, photo){
        let outer = this;
        //Json to string send the uuid of current player to backend
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid':outer.uuid,
            'username':username,
            'photo': photo,
        }));
    }


    //traverse all the players to get id 
    get_player(uuid){
        let players = this.playground.players;
        for(let i = 0; i < players.length; i++){
            let player = players[i];
            if(player.uuid === uuid)
                return player;
        }

        return null;
    }

    receive_create_player(uuid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx,ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"move_to",
            'uuid':outer.uuid,
            'tx':tx,
            'ty':ty,

        }));
    }

    receive_move_to(uuid,tx,ty){
        let player = this.get_player(uuid);

        if(player){
            player.move_to(tx,ty);
        }
    }

    

   send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }
 //need to sync the pos and angle of attackee each time cause delay will influence the pos
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "attack",
            'uuid' : outer.uuid,
            'attackee_uuid' : attackee_uuid,
            'x' : x,
            'y' : y,
            'angle' : angle,
            'damage' : damage,
            'ball_uuid' : ball_uuid,
        }));
    }

    //method for receive attack message at front end
    receive_attack(uuid,attackee_uuid,x,y,angle,damage,ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee){
            attackee.receive_attack(x,y,angle,damage,ball_uuid,attacker);
        }
    }

    send_blink(tx,ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "blink",
            'uuid': outer.uuid,
            'tx' : tx,
            'ty' : ty,
        }));
    }

    receive_blink(uuid,tx,ty){
        let player = this.get_player(uuid);
        if(player){
            player.blink(tx,ty);
        }
    }
    

    send_message(text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid' : outer.uuid,
            'text' : text,
        }));
    }

    receive_message(uuid,text){
        let player = this.get_player(uuid);
        if(player){
            player.playground.chat_field.add_message(player.username, text);
        }
    }

}
