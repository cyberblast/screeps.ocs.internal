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

        // attackTrain
        Creep.setup.trainDestroyer = load("creep.setup.trainDestroyer");
        Creep.setup.trainHealer = load("creep.setup.trainHealer");
        Creep.setup.trainTurret = load("creep.setup.trainTurret");

        Creep.behaviour.trainDestroyer = load("creep.behaviour.trainDestroyer");
        Creep.behaviour.trainHealer = load("creep.behaviour.trainHealer");
        Creep.behaviour.trainTurret = load("creep.behaviour.trainTurret");

        global.FLAG_COLOR.attackTrain = {
            color: COLOR_RED,
            secondaryColor: COLOR_WHITE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_WHITE}
        }

        Spawn.priorityLow.push(Creep.setup.trainDestroyer);
        Spawn.priorityLow.push(Creep.setup.trainHealer);
        Spawn.priorityLow.push(Creep.setup.trainTurret);
    }
}
module.exports = mod;
