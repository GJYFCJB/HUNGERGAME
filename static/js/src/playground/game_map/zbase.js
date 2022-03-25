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
