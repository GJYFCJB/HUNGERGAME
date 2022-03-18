class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div>PlayGround</div>`);

        this.hide();
        this.root.$ac_game.append(this.$playground);
        
        this.start()
    }

    start(){
    }

    show(){
        //open playground page
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
