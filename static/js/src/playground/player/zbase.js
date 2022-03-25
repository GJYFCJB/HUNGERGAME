class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, character,username, photo){

       
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9;
        this.safeTime = 0;
        this.fireballs = [];
        this.cur_skill = null;
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }

        //add waiting time for players at first
        if(this.character === "me"){
            this.fireball_coldtime = 3;//s
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }

        this.unbinded_funcs = [];
    }

    //AI for NPC
    start(){

        this.playground.player_count ++;
        if(this.playground.player_count <= 1){
            this.playground.notice_board.write(this.playground.player_count + " player has prepared");
        }else{
            this.playground.notice_board.write(this.playground.player_count + " players have prepared");
        }

        if( this.playground.player_count >= 3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting!");
        }



        if(this.character === "me"){
            this.add_listening_events();
        }else if (this.character === "robot"){
            //change to relative position
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx,ty);
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });


        let canvas_mousedown = function(e){
            if(outer.playground.state !== "fighting")
                return true;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            //press left mouse -> realtive posotion
            if(e.which === 3){
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty =  (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                //if in the mmulti pattern need broadcast pos to other players
                if(outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(tx,ty);
                }
            }
            //press right mouse
            else if (e.which === 1){

                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if(outer.cur_skill === "fireball"){
                   if(outer.fireball_coldtime > outer.eps)
                        return false;

                    let fireball = outer.shoot_fireball(tx,ty);
                    //call the backend method here send this pos message to another views(players)
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx,ty,fireball.uuid);
                    }
                }else if(outer.cur_skill === "blink"){
                    if(outer.blink_coldtime > outer.eps)
                        return false;

                    outer.blink(tx,ty);

                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_blink(tx,ty);
                    }

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

            if(e.which === 13){//enter
                if(outer.playground.mode === "multi mode"){//open chat field
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }else if(e.which === 27){
                if(outer.playground.mode === "multi mode"){//close chat 
                    outer.playground.chat_field.hide_input();
                }
            }
            //press 'Q' fireball
            if(outer.playground.state !== "fighting")
                return true;

            if(e.which === 81){
                //only if time exceed, players can release skills
                if(outer.fireball_coldtime > outer.eps)
                    return true;

                outer.cur_skill = "fireball";
                return false;
            }else if(e.which === 70){//f
                if(outer.blink_coldtime > outer.eps)
                    return true;

                outer.cur_skill = "blink";
                return false;
            }
        }

        //need bind this listening to single view instead of window 
        //$(window).keydown(window_keydown_q);
        this.playground.game_map.$canvas.keydown(window_keydown_q);

        let unbind_window_keydown_q = () => {
                $(window).unbind('keydown', window_keydown_q);
        }

        this.unbinded_funcs.push(unbind_window_keydown_q);
     }
   

    // attack method, will spouse a fireball can make injury, this is one skill can use in the game
    shoot_fireball(tx,ty){

        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 0.8;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);
        this.fireball_coldtime = 3;//reset coldtime
        //get uuid of bullet
        return fireball;
    }

    //look out the ball and del it with its id
    destroy_fireball(uuid){
        for(let i = 0; i < this.fireballs.length; i++){
            let fireball = this.fireballs[i];
            if(fireball.uuid === uuid){
                fireball.destroy();
                break;
            }
        }
    }

    //blink skill
    blink(tx,ty){
        let d = this.get_dist(this.x,this.y,tx,ty);
        d = Math.min(d,0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;//after blink stop instead of continuing moving
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
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 70;
        this.speed *= 0.85;


    }
    //receive method for attacked by the enemey -> first del attacker's ball(has made injury),then sync receiver's pos
    receive_attack(x,y,angle,damage,ball_uuid,attacker){
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle,damage);
    }

    update(){

        this.safeTime += this.timedelta / 1000;
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_coldtime();
        }
        this.update_coldtime();
        this.update_move();
        this.render();

    }

    update_coldtime(){
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime,0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime,0);

    }

    //this.fireball_coldtime = 3;//reset coldtime
    //update players movement
    update_move(){


        if(this.character === "robot" && this.safeTime > 5 && Math.random() < 1 / 300.0){
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
                if(this.character === "robot"){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
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

    }

    render(){
        //change the absolate pos to relative pos int the canvas
        let scale = this.playground.scale;
        //use string parameter to identify 'me', 'robot', and enemey -> only robot need draw
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0,Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime(){
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.fireball_coldtime > 0.01){
            this.ctx.beginPath();

            //start at center
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime/3) - Math.PI / 2, true);
            //draw line back to center
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0,0,255,0.6)";
            this.ctx.fill();
        }

        x = 1.62, y= 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.blink_coldtime > 0.01){
            this.ctx.beginPath();

            //start at center
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime/5) - Math.PI / 2, true);
            //draw line back to center
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0,0,255,0.6)";
            this.ctx.fill();
        }
    }

    on_destroy(){

        if(this.character === "me")
            this.playground.state = "over";

        for(let i = 0; i < this.unbinded_funcs.length; i++){
            this.unbinded_funcs[i]();
        }

        this.unbinded_funcs = [];

        for(let i = 0; i < this.playground.players.length; i++) {
            if(this.playground.players[i] == this){
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
