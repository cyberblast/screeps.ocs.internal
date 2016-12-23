var mod = {
    extend: function(){
        // warrior
        Creep.setup.warrior = load("creep.setup.warrior");
        Creep.behaviour.warrior = load("creep.behaviour.warrior");
        // hopper
        Creep.setup.hopper = load("creep.setup.hopper");
        Creep.behaviour.hopper = load("creep.behaviour.hopper");        
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
        Spawn.priorityLow.push(Creep.setup.hopper);
    }
}
module.exports = mod;
