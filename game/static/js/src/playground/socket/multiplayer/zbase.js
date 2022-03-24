class MultiPlayerSocket{
        constructor(playground){
            
            this.playground = playground;
            
            //must be same as game.rouuting.py's route
            this.ws = new WebSocket("wss://app1901.acapp.acwing.com.cn/wss/multiplayer/");
            
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
            }
        };
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
}
