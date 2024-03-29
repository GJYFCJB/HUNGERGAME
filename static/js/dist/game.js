class AcGameMenu
{
        constructor(root)
        {
             this.root = root;
             this.$menu = $(`
             <div class="ac-game-menu" >
                  <div class = "ac-game-menu-field">
                       <div class = "ac-game-menu-field-item ac-game-menu-field-item-single">
                            Single Player
                       </div>
                       <br>
                       <div class = "ac-game-menu-field-item ac-game-menu-field-item-multi">
                            Multiplayer
                       </div>
                       <br>
                       <div class = "ac-game-menu-field-item ac-game-menu-field-item-settings">
                            Settings
                       </div>
                       <br>
                       <div class = "ac-game-menu-field-item ac-game-menu-field-item-logout">
                            Logout
                       </div>
                  </div>
              </div>`);

             this.$menu_settings = $(`
             <div class="ac-game-menu" >
                  <div class = "ac-game-menu-field">
                       <div class = "ac-game-menu-field-item ac-game-menu-field-sound">
                            Sound
                       </div>
                       <br>
                       <div class = "ac-game-menu-field-item ac-game-menu-field-map">
                            Map
                       </div>
                       <br>
                       <div class = "ac-game-menu-field-item ac-game-menu-field-avatar">
                            Avatar
                       </div>
                       <br>
                       <div class = "ac-game-menu-field-item ac-game-menu-field-menu">
                            Menu
                       </div>
                  </div>
              </div>`);



            this.$menu.hide();
            this.$menu_settings.hide();
            this.root.$ac_game.append(this.$menu);
            this.root.$ac_game.append(this.$menu_settings);
            this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single');
            this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi');
            this.$m_settings = this.$menu.find('.ac-game-menu-field-item-settings');
            this.$settings = this.$menu.find('.ac-game-menu-field-item-logout');

            this.$_sound = this.$menu_settings.find('.ac-game-menu-field-sound');
            this.$_map = this.$menu_settings.find('.ac-game-menu-field-map');
            this.$_avatar = this.$menu_settings.find('.ac-game-menu-field-avatar');
            this.$_menu = this.$menu_settings.find('.ac-game-menu-field-menu');

            this.start();
        }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");

        });

        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });

        this.$m_settings.click(() => {
            outer.hide();
            outer.show_settings();
        })

        this.$_menu.click(() => {
            outer.hide_settings();
            outer.show();
        })



    }

    show(){
        //show menu page
        this.$menu.show();
    }

    hide(){
        //close menu page
        this.$menu.hide();
    }

    show_settings(){
            this.$menu_settings.show();
    }

    hide_settings(){
        //close menu page
        this.$menu_settings.hide();
    }

}









let AC_GAME_OBJECTS = [];

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false; // if executed start function
        this.timedelta = 0; //the time interval between this page and last page
        this.uuid = this.create_uuid();

    
    }

    //create unique id for each object
    create_uuid(){
        let res = "";
        for(let i = 0; i < 15; i++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start(){ //only execute at the first page

    }

    update(){//execute each page

    }

    on_destroy(){ //only execute before object deleted
        
    }

    destroy(){ //detele game object
        this.on_destroy();
        for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
            if(AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i,1);
              
                break;
            }
        }
    }
}

let last_timestamp;
//when 1st page not rendered: -> render the first
//if 1st rendered, update the next page and calcaulate time interval first
let AC_GAME_ANIMATION = function(timestamp){

    for(let i = 0; i < AC_GAME_OBJECTS.length; i++){
            let obj = AC_GAME_OBJECTS[i];
            if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}


requestAnimationFrame(AC_GAME_ANIMATION);












class ChatField{
    
    constructor(playground){
        this.playground = playground;

        this.$history = $(`<div class = "ac-game-chat-field-history">History:</div>`);
        this.$input = $(`<input type="text" class = "ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();
        this.func_id = 0;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        
        this.start();
    }

    start(){
        this.add_listening_events();
    }

    //listening esc 
    add_listening_events(){
        let outer = this;

        this.$input.keydown(function(e){
            if(e.which === 27){
                outer.hide_input();
                return false;
            }else if (e.which === 13){
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if(text){
                    //each time clear message
                    outer.$input.val("");
                    outer.add_message(username,text);
                    outer.playground.mps.send_message(text);
                }
                return false;
            }
        });
    }
    
    render_message(message){
        return $(`<div>${message}</div>`);
    }
    add_message(username, text){
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);

    }
    show_history(){
        let outer = this; 
        this.$history.fadeIn();

        if(this.func_id) clearTimeout(this.func_id);
//each time call the time, rem the id and clear so each time open the chat the history will show 3s
        this.func_od = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        },3000);
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input(){
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
class GameMap extends AcGameObject{
    constructor(playground){
        //create canvasmap of this game parameter -> playground cause the szie will be same
        super();
        this.playground = playground;
        //tabindex to add listening
        this.$canvas = $(`<canvas tabindex=0></canvas>`); 
        this.ctx = this.$canvas[0].getContext(`2d`);
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }    

    start(){
        //focus method
        this.$canvas.focus();
    }

    update(){
        //the map should renew every page so call render in update
        this.render();
    }

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        //each time we print untransparet canvas so there will be no 
        //Gradient color change
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);

    }
    



}
class NoticeBoard extends AcGameObject{
    constructor(playground){
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "0 player has prepared";

        this.start();
    }

    start(){

    }

    write(text){
        this.text = text;
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 20);
    }
}


class Particle extends AcGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground = playground;
        this.ctx= this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.eps = 0.01;
        this.move_length = move_length;
    }

    start(){
        
    }

    update(){
        if(this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        
        let moved = Math.min(this.move_length, this.speed * this.timedelta /1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
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

class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx=  vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed= speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;
    }

    start(){
        
    }

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }

        this.update_move();
        //we identify if attacked in one view instead of each view actually we identify if attacked in the attacker's view reason: need to synchroniztion
        if(this.player.character !== "enemy"){
            this.update_attack();
        }


        this.render();
    }

    update_move(){
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);

        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }


    update_attack(){
        for(let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
                break;
            }
        }
    }

 

    get_dist(x1, y1 ,x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player){
        let distance = this.get_dist(this.x, this.y, player.x , player.y);
        if(distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);

        //call the attack method to send and receive info 
        if(this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }




    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    //destroy the balls of players before we destroy it from server
    on_destroy(){
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i++){
            if(fireballs[i] === this){
                fireballs.splice(i,1);
                break;
            }
        }
    }
}

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
        this.mode = mode;
        this.state = "waiting"; //wait for the starting - > fighting after the player >=3 -> die -> over

        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();
       
        this.players = [];

        this.players.push(new Player(this, this.width/2/this.scale,1/2, 0.05,"white",0.15, "me",this.root.settings.username, this.root.settings.photo));
        
        if(mode === "single mode"){
            for(let i = 0; i < 10; i++){
                this.players.push(new Player(this, this.width/2/this.scale,1/2,0.05,this.get_random_color(),0.15, "robot"));
            }
        }else if (mode === "multi mode"){
            this.chat_field = new ChatField(this);
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

class Settings{
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if(this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class = "ac-game-settings">
    <div class = "ac-game-settings-login">
        <div class = "ac-game-settings-title">
            Sign in
        </div>
        <div class = "ac-game-settings-username">
            <div class = "ac-game-settings-item">
                <input type ="text" placeholder = "username">
            </div>
       </div>
       <div class = "ac-game-settings-password">
            <div class = "ac-game-settings-item">
                <input type = "password" placeholder = "password">
            </div>
       </div>
       <div class = "ac-game-settings-submit">
             <div class = "ac-game-settings-item">
                <button>Sign in</button>
             </div>
       </div>
       <div class = "ac-game-settings-error-messages">

       </div>
       <div class = "ac-game-settings-option">
            Sign up
       </div>
       <br>
       <div class = "ac-game-settings-acwing">
            <img width = "30" src = "https://hungerplay.com/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Sign in with Google
            </div>
       </div>
    </div>

    <div class = "ac-game-settings-register">
        <div class = "ac-game-settings-title">
            Sign up
        </div>
        <div class = "ac-game-settings-username">
            <div class = "ac-game-settings-item">
                <input type ="text" placeholder = "username">
            </div>
       </div>
       <div class = "ac-game-settings-password password-first">
            <div class = "ac-game-settings-item">
                <input type = "password" placeholder = "password">
            </div>
       </div>
       <div class = "ac-game-settings-password password-second">
            <div class = "ac-game-settings-item">
                <input type = "password" placeholder = "confirm">
            </div>
       </div>
       <div class = "ac-game-settings-submit">
             <div class = "ac-game-settings-item">
                <button>Sign up</button>
             </div>
       </div>
       <div class = "ac-game-settings-error-messages">
       </div>
       <div class = "ac-game-settings-option">
            Sign in
       </div>
       <br>
       <div class = "ac-game-settings-acwing">
            <img width = "30" src = "https://hungerplay.com/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Sign in with Google
            </div>
       </div>
    </div>
</div>
`);
        //use find function to extract elements from html and then use django 
        this.$login = this.$settings.find(".ac-game-settings-login");

        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");

        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".password-first input");
        this.$register_password_confirm = this.$register.find(".password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");


        this.$register.hide();

        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start(){
        this.getinfo();
        this.add_listening_events();//start listening
    }

    //bind the listening function
    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();

    }

    //login method listening
    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_on_remote();
        });
    }

    //register method listening
    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_on_remote();
        });
    }

    login_on_remote(){
        //login in the remote server
        let outer = this;

        let username = this.$login_username.val(); //
        let password = this.$login_password.val(); // 

        this.$login_error_message.empty(); // 

        $.ajax({
            url: "https://hungerplay.com/settings/login/", //
            type: "GET",
            data: {
                username: username, // 
                password: password, 
            },
            success: function(resp){

                if (resp.result === "success")
                {
                    location.reload(); // 
                }
                else
                {
                    outer.$login_error_message.html(resp.result); 
                }
            }
        });
    }


    register_on_remote(){
        //register on the remote server
        let outer = this;
        let username = this.$register_username.val();

        let password = this.$register_password.val();

        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url : "https://hungerplay.com/settings/register/",
            type: "GET",
            data: {
                username : username,
                password : password,
                password_confirm: password_confirm,
            },
            success: function(resp){

                if(resp.result === "success"){
                    location.reload(); //reload the page
                }else{
                    outer.$register_error_message.html(resp.result);
                }
            }
        });

    }


    logout_on_remote(){
        //log out the remote server
        if (this.platform === "ACAPP"){
            //the api for sign in with acwing 
            // this.root.AcwingOs.api.window.close();
            return false;
        }else{
            $.ajax({
                url: "https://hungerplay.com/settings/logout/", //
                type: "GET",
                success: function(resp){

                    if (resp.result === "success")
                    {
                        location.reload(); //
                    }
                }
            });
        }
    }

    register(){
        //close login page -> open register page
        this.$login.hide();
        this.$register.show();
    }

    //open login page
    login(){
        //close register page -> open login page
        this.$register.hide();
        this.$login.show();
    }

    getinfo(){
        let outer = this;

        $.ajax({
            url : "https://hungerplay.com/settings/getinfo/",

            typr: "GET",
            data : {
                platform: outer.platform,
            },
            success: function(resp){

                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }else{
                    outer.login();
                }
            }
        });
    }


    hide(){
        this.$settings.hide();

    }

    show(){
        this.$settings.show();
    }


}
export class AcGame{
    constructor(id, AcWingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        //to identify which client side the game use
        this.AcWingOS = AcWingOS;
        this.menu = new AcGameMenu(this);
        this.settings = new Settings(this);

        this.playground = new AcGamePlayground(this);

        this.start();

       
    }

    start(){
    }
}
