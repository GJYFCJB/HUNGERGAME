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
