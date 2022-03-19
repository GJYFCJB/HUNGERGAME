class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.safeTime = 0;
        this.cur_skill = null;
        this.unbinded_funcs = [];
    }

    //AI for NPC
    start(){
        if(this.is_me){
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx,ty);
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        
        let canvas_mousedown = function(e){

            const rect = outer.ctx.canvas.getBoundingClientRect();
            //press left mouse
            if(e.which === 3){
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            }
            //press right mouse
            else if (e.which === 1){
                if(outer.cur_skill === "fireball"){
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill  = null;
            }
        }

        this.playground.game_map.$canvas.mousedown(canvas_mousedown);

        let unbind_canvas_mousedown = () => {
            this.playground.game_map.$canvas.unbind('mousedown', canvas_mousedown)
        }

        this.unbinded_funcs.push(unbind_canvas_mousedown);

        let window_keydown_q = function(e){
        //press 'Q' fireball
            if(e.which === 81){
                outer.cur_skill = "fireball";
                return false;
            }
        }

        $(window).keydown(window_keydown_q);

        let unbind_window_keydown_q = () => {
            $(window).unbind('keydown', window_keydown_q);
        }

        this.unbinded_funcs.push(unbind_window_keydown_q);
    }

    // attack method, will spouse a fireball can make injury, this is one skill can use in the game
    shoot_fireball(tx,ty){
        
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 0.8;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
        
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx,ty){
        this.move_length = this.get_dist(this.x,this.y,tx,ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = 1.5 * Math.cos(angle); //x axis speed
        this.vy = 1.5 * Math.sin(angle); //y axis speed
    }

    is_attacked(angle,damage){
        for(let i = 0; i < 10 + Math.random() * 15; i++){
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = "red";
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed,move_length);
        }

        this.radius -= damage;
        if(this.radius < 10){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 70;
        this.speed *= 0.85;

        
    }

    update(){

        this.safeTime += this.timedelta / 1000;

            if(!this.is_me && this.safeTime > 5 && Math.random() < 1 / 400.0){
                let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx,ty);
        }

        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            //player should exist always implement render in update
            //have renewd do not need to move now
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx,ty);
                }
            }//else should move to the target and calculate how many to move each page.
            else{
                let moveS =  this.speed * this.timedelta/1000; //distance should move according to time interval each page
                let moved = Math.min(this.move_length,moveS); //real dis moved should be the min value of length and moveS
                this.x += moved * this.vx;
                this.y += moved * this.vy;
                this.move_length -= moved; //should minus the dis move each page from length so can get to the target
            }
        }

        this.render();
        
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){

        for(let i = 0; i < this.unbinded_funcs.length; i++){
                this.unbinded_funcs[i]();
        }

        this.unbinded_funcs = [];

        for(let i = 0; i < this.playground.players.length; i++) {
            if(this.playground.players[i] == this){
            this.playground.players.splice(i, 1);
            }
        }
    }
}
