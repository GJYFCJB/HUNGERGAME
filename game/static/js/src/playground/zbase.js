class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class = "ac-game-playground"></div>`);

        this.hide();
        //just append the playground one time
        this.root.$ac_game.append(this.$playground);
        this.start()
    }
    
    get_random_color(){
        let colors = ["blue", "pink", "grey", "orange", "purple"];
        return colors[Math.floor(Math.random() * 5)];
    }


    start(){
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }

    resize(){
        //extract the width and height -> get the unit to resize
        console.log("resize");
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if(this.game_map) this.game_map.resize();
    }

    show(mode){
        let outer = this;
        //open playground page
        this.$playground.show();

       
      
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.resize();

        this.players = [];

        this.players.push(new Player(this, this.width/2/this.scale,1/2, 0.05,"white",0.15, "me",this.root.settings.username, this.root.settings.photo));
        
        if(mode === "single mode"){
            for(let i = 0; i < 10; i++){
                this.players.push(new Player(this, this.width/2/this.scale,1/2,0.05,this.get_random_color(),0.15, "robot"));
            }
        }else if (mode === "multi mode"){
            //create Websocket
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            //will send message to backend when wss created successfully
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);

            };
        }
    }

        

    hide(){
        this.$playground.hide();
    }
}
