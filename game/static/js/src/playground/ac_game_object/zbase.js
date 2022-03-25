


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












