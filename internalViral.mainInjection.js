let mod = {};
module.exports = mod;
mod.extend = function(){
    try {
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
       //train flags BLUE - to be expanded for different train types
        global.FLAG_COLOR.trainFollow = { // attack trains follow this flag
            color: COLOR_BLUE,
            secondaryColor: COLOR_BLUE,
            filter: {'color': COLOR_BLUE, 'secondaryColor': COLOR_BLUE}
        };
        global.FLAG_COLOR.trainHeal = { // spawns destroyer/heal/heal train
            color: COLOR_BLUE,
            secondaryColor: COLOR_GREEN,
            filter: {'color': COLOR_BLUE, 'secondaryColor': COLOR_GREEN}
        };
        global.FLAG_COLOR.trainTurret = { // spawns destroyer/heal/turret train
            color: COLOR_BLUE,
            secondaryColor: COLOR_WHITE,
            filter: {'color': COLOR_BLUE, 'secondaryColor': COLOR_WHITE}
        };
        // warrior
        Creep.behaviour.warrior = load("creep.behaviour.warrior");
        // hopper
        Creep.setup.hopper = load("creep.setup.hopper");
        Creep.behaviour.hopper = load("creep.behaviour.hopper");
        //sourceKiller
        Creep.action.sourceKiller = load("creep.action.sourceKiller");
        Creep.setup.sourceKiller = load("creep.setup.sourceKiller");
        Creep.behaviour.sourceKiller = load("creep.behaviour.sourceKiller");
        // attackTrain
        Task.train = load("task.train");
        Task.addTasks(Task.train)
        Creep.behaviour.leader = load("creep.behaviour.leader");
        Creep.behaviour.follower = load("creep.behaviour.follower");

        //setup prio's (old - to be migrated to tasks)
        Spawn.priorityLow.push(Creep.setup.hopper);
        Spawn.priorityLow.push(Creep.setup.sourceKiller);


        // combat effectiveness calc TODO Population.extend()
        Population.stats.creep.armorParts = { // combat buffer
            [TOUGH]: true,
            [MOVE]: true,
            [CARRY]: true,
        };
        Population.stats.creep.coreParts = { // run away
            [MOVE]: true,
            [HEAL]: true,
        };
    }
    catch(e){
        console.log(e);
    }
};
//mod.flush = function(){};
//mod.analyze = function(){};
//mod.register = function(){};
//mod.execute = function(){};
//mod.cleanup = function(){};
