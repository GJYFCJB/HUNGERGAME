
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
