var mod = {
    extend: function(){
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
        global.FLAG_COLOR.attackTrain = { // placed in room to attack, once there will dismantle/attack orange/yellow flags
            color: COLOR_RED,
            secondaryColor: COLOR_WHITE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_WHITE}
        };

        // warrior
        Creep.setup.warrior = load("creep.setup.warrior");
        Creep.behaviour.warrior = load("creep.behaviour.warrior");
        // hopper
        Creep.setup.hopper = load("creep.setup.hopper");
        Creep.behaviour.hopper = load("creep.behaviour.hopper");
        Spawn.priorityLow.push(Creep.setup.hopper);
        //sourceKiller
        Creep.action.sourceKiller = load("creep.action.sourceKiller");
        Creep.setup.sourceKiller = load("creep.setup.sourceKiller");
        Creep.behaviour.sourceKiller = load("creep.behaviour.sourceKiller");
        Spawn.priorityHigh.push(Creep.setup.sourceKiller); //probably important

        // attackTrain
        Creep.setup.trainDestroyer = load("creep.setup.trainDestroyer");
        Creep.setup.trainHealer = load("creep.setup.trainHealer");
        Creep.setup.trainTurret = load("creep.setup.trainTurret");

        Creep.behaviour.trainDestroyer = load("creep.behaviour.trainDestroyer");
        Creep.behaviour.trainHealer = load("creep.behaviour.trainHealer");
        Creep.behaviour.trainTurret = load("creep.behaviour.trainTurret");

        Spawn.priorityLow.push(Creep.setup.trainDestroyer);
        Spawn.priorityLow.push(Creep.setup.trainHealer);
        Spawn.priorityLow.push(Creep.setup.trainTurret);
    }
}
module.exports = mod;
