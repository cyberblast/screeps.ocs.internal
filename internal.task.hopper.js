// This task will react on hopper flags
let mod = new Task('hopper');
module.exports = mod;
// for each flag
mod.handleFlagFound = flag => {
    // if it is a hopper flag
    if( flag.color == FLAG_COLOR.hopper.color && flag.secondaryColor == FLAG_COLOR.hopper.secondaryColor){
        // check if a new creep has to be spawned
        Task.hopper.checkForRequiredCreeps(flag);
    }
};
// check if a new creep has to be spawned
mod.checkForRequiredCreeps = (flag) => {
    // get task memory
    let memory = Task.hopper.memory(flag);
    // count creeps assigned to task

    let count = memory.queued.length + memory.spawning.length + memory.running.length;
    
    // if creep count below requirement spawn a new creep creep 
    if( count < 1 ) {
        Task.spawn(
            Task.hopper.creep.hopper, // creepDefinition
            { // destiny
                task: 'hopper', // taskName
                targetName: flag.name, // targetName
            }, 
            { // spawn room selection params
                targetRoom: flag.pos.roomName, 
                minEnergyCapacity: 1000,
                maxRange: 1,
                allowTargetRoom: true
            },
            creepSetup => { // callback onQueued
                let memory = Task.hopper.memory(Game.flags[creepSetup.destiny.targetName]);
                memory.queued.push({
                    room: creepSetup.queueRoom,
                    name: creepSetup.name
            });
        });
    }
};
// when a creep starts spawning
mod.handleSpawningStarted = params => { // params: {spawn: spawn.name, name: creep.name, destiny: creep.destiny}
    // ensure it is a creep which has been queued by this task (else return)
    if ( !params.destiny || !params.destiny.task || params.destiny.task != 'hopper' )
        return;
    // get flag which caused queueing of that creep
    // TODO: remove  || creep.data.destiny.flagName (temporary backward compatibility)
    let flag = Game.flags[params.destiny.targetName || params.destiny.flagName];
    if (flag) {
        // get task memory
        let memory = Task.hopper.memory(flag);
        // save spawning creep to task memory
        memory.spawning.push(params);
        // clean/validate task memory queued creeps
        let queued = [];
        let validateQueued = o => {
            let room = Game.rooms[o.room];
            if( (room.spawnQueueMedium.some( c => c.name == o.name)) || (room.spawnQueueLow.some( c => c.name == o.name)) ){
                queued.push(o);
            }
        };
        memory.queued.forEach(validateQueued);
        memory.queued = queued;
    }
};
// when a creep completed spawning
mod.handleSpawningCompleted = creep => {
    // ensure it is a creep which has been requested by this task (else return)
    if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != 'hopper')
        return;
    // get flag which caused request of that creep
    // TODO: remove  || creep.data.destiny.flagName (temporary backward compatibility)
    let flag = Game.flags[creep.data.destiny.targetName || creep.data.destiny.flagName];
    if (flag) {
        // calculate & set time required to spawn and send next substitute creep
        // TODO: implement better distance calculation
        creep.data.predictedRenewal = creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*50);

        // get task memory
        let memory = Task.hopper.memory(flag);
        // save running creep to task memory
        memory.running.push(creep.name);
        // clean/validate task memory spawning creeps
        let spawning = [];
        let validateSpawning = o => {
            let spawn = Game.spawns[o.spawn];
            if( spawn && ((spawn.spawning && spawn.spawning.name == o.name) || (spawn.newSpawn && spawn.newSpawn.name == o.name))) {
                spawning.push(o);
            }
        };
        memory.spawning.forEach(validateSpawning);
        memory.spawning = spawning;
    }
};
// when a creep died (or will die soon)
mod.handleCreepDied = name => {
    // get creep memory
    let mem = Memory.population[name];
    // ensure it is a creep which has been requested by this task (else return)
    if (!mem || !mem.destiny || !mem.destiny.task || mem.destiny.task != 'hopper')
        return;
    // get flag which caused request of that creep
    // TODO: remove  || creep.data.destiny.flagName (temporary backward compatibility)
    let flag = Game.flags[mem.destiny.targetName || mem.destiny.flagName];
    if (flag) {
        // get task memory
        let memory = Task.hopper.memory(flag);
        // clean/validate task memory running creeps
        let running = [];
        let validateRunning = o => {
            let creep = Game.creeps[o];
            // invalidate old creeps for predicted spawning
            // TODO: better distance calculation
            if( creep && creep.name != name && creep.data !== undefined && creep.data.spawningTime !== undefined && creep.ticksToLive > (creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*25) ) ) {
                running.push(o);
            }
        };
        memory.running.forEach(validateRunning);
        memory.running = running;
    }
};
// get task memory
mod.memory = (flag) => {
    if( !flag.memory.tasks ) 
        flag.memory.tasks = {};
    if( !flag.memory.tasks.hopper ) {
        flag.memory.tasks.hopper = {
            queued: [], 
            spawning: [],
            running: []
        };
    }
    return flag.memory.tasks.hopper;
};

mod.creep = {
    hopper: {
        fixedBody: [TOUGH, MOVE, MOVE, HEAL],
        multiBody: [TOUGH, MOVE, MOVE, HEAL],
        name: "hopper", 
        behaviour: "hopper", 
        queue: 'Low'
    },
};
