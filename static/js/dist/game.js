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
                            Logout
                       </div>
                  </div>
              </div>
         `);
            this.$menu.hide();
            this.root.$ac_game.append(this.$menu);
            this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single');
            this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi');
            this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

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

    }

    show(){
        //show menu page
        this.$menu.show();
    }

    hide(){
        //close menu page
        this.$menu.hide();
    }

} 



let AC_GAME_OBJECTS = [];

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false; // if executed start function
        this.timedelta = 0; //the time interval between this page and last page
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
                //console.log("destroy");
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












class GameMap extends AcGameObject{
    constructor(playground){
        //create canvasmap of this game parameter -> playground cause the szie will be same
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext(`2d`);
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }    

    start(){
    }

    update(){
        //the map should renew every page so call render in update
        this.render();
    }


    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);

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
        this.eps = 0.3;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
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
        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
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
        if(this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
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
        this.eps = 0.1;
    }

    start(){
        
    }

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        

        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;


        for(let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
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
        this.destroy();
    }




    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class = "ac-game-playground"></div>`);

        this.hide();

        this.start()
    }
    
    get_random_color(){
        let colors = ["blue", "pink", "grey", "orange", "purple"];
        return colors[Math.floor(Math.random() * 5)];
    }


    start(){
       
    }

    show(){
        //open playground page
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];

        this.players.push(new Player(this, this.width/2,this.height/2,this.height * 0.05,"white",this.height * 0.15, true));

        for(let i = 0; i < 10; i++){
             this.players.push(new Player(this, this.width/2,this.height/2,this.height * 0.05,this.get_random_color(),this.height * 0.15, false));
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
            <img width = "30" src = "https://app1901.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
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
            <img width = "30" src = "https://app1901.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
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
            url: "https://app1901.acapp.acwing.com.cn/settings/login/", // 
            type: "GET",
            data: {
                username: username, // 
                password: password, 
            },
            success: function(resp){
                console.log(resp); //
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
            console.log(username);
            let password = this.$register_password.val();
            console.log(password);
            let password_confirm = this.$register_password_confirm.val();
            this.$register_error_message.empty();

        $.ajax({
            url : "https://app1901.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username : username,
                password : password,
                password_confirm: password_confirm,
            },
            success: function(resp){
                console.log(resp);
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
        if (this.platform === "ACAPP") return false; 

        $.ajax({
            url: "https://app1901.acapp.acwing.com.cn/settings/logout/", //
            type: "GET",
            success: function(resp){
                console.log(resp); // 
                if (resp.result === "success")
                {
                    location.reload(); //
                }
            }
        });
    }


    //open register page
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
            url : "https://app1901.acapp.acwing.com.cn/settings/getinfo/",

            typr: "GET",
            data : {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
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
