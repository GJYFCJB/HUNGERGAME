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






