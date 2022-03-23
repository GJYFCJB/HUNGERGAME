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
