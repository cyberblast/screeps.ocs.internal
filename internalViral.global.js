var mod = {
    extend: function(){
        // warrior
        Creep.setup.warrior = load("creep.setup.warrior");
        Creep.behaviour.warrior = load("creep.behaviour.warrior");
        // hopper
        Creep.setup.hopper = load("creep.setup.hopper");
        Creep.behaviour.hopper = load("creep.behaviour.hopper");  
        //sourceKiller
        Creep.action.sourceKiller = load("creep.action.sourceKiller");
        Creep.setup.sourceKiller = load("creep.setup.sourceKiller");
        Creep.behaviour.sourceKiller = load("creep.behaviour.sourceKiller");
        
        // flags
        global.FLAG_COLOR.hopper = { // the room where tower is
            color: COLOR_RED,
            secondaryColor: COLOR_PURPLE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_PURPLE }
        };
        global.FLAG_COLOR.hopperHome = { // room to heal in
            color: COLOR_RED,
            secondaryColor: COLOR_BLUE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_BLUE }
        };
        global.FLAG_COLOR.sourceKiller ={
            color: COLOR_YELLOW,
            secondaryColor: COLOR_RED,
            filter: {'color': COLOR_YELLOW, 'secondaryColor': COLOR_RED }
        };    
            
        Spawn.priorityLow.push(Creep.setup.hopper);
        Spawn.priorityHigh.push(Creep.setup.sourceKiller); //probably important 
    }
}
module.exports = mod;
