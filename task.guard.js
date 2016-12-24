var mod = {
    register: () => {
        Flag.found.on( flag => Task.guard.handleFlagFound(flag) );
        Creep.spawningStarted.on( params => Task.guard.handleSpawningStarted(params) );
        Creep.spawningCompleted.on( creep => Task.guard.handleSpawningCompleted(creep) );
        Creep.predictedRenewal.on( creep => Task.guard.handlePredictedRenewal(creep) );
    },
    handleFlagFound: flag => {
        if( flag.color == FLAG_COLOR.defense.color && flag.secondaryColor == FLAG_COLOR.defense.secondaryColor ){
            Task.guard.checkForRequiredCreeps(flag);
        }
    },
    handleSpawningStarted: params => { // params: {spawn: spawn.name, name: creep.name, destiny: creep.destiny}
        if ( !params.destiny || !params.destiny.task || params.destiny.task != 'guard' )
            return;
        let flag = Game.flags[params.destiny.flagName];
        if (flag) {
            let memory = Task.guard.memory(flag);
            // add to spawning creeps
            memory.spawning.push(params);
            // validate queued creeps
            let queued = []
            let validateQueued = o => {
                let room = Game.rooms[o.room];
                if(room.spawnQueueMedium.some( c => c.name == o.name)){
                    queued.push(o);
                }
            };
            memory.queued.forEach(validateQueued);
            memory.queued = queued;
        }
    },
    handleSpawningCompleted: creep => {
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != 'guard')
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            // TODO: implement better distance calculation
            creep.data.predictedRenewal = creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*50);

            let memory = Task.guard.memory(flag);
            // add to running creeps
            memory.running.push(creep.name);
            // validate spawning creeps
            let spawning = []
            let validateSpawning = o => {
                let spawn = Game.spawns[o.spawn];
                if( spawn && ((spawn.spawning && spawn.spawning.name == o.name) || (spawn.newSpawn && spawn.newSpawn.name == o.name))) {
                    count++;
                    spawning.push(o);
                }
            };
            memory.spawning.forEach(validateSpawning);
            memory.spawning = spawning;
        }
    },
    handlePredictedRenewal: creep => {
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != 'guard')
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            let memory = Task.guard.memory(flag);
            // validate running creeps
            let running = []
            let validateRunning = o => {
                let creep = Game.creeps[o];
                // invalidate old creeps for predicted spawning
                // TODO: better distance calculation
                if( creep && creep.ticksToLive > (creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*50) ) ) {
                    running.push(o);
                }
            };
            memory.running.forEach(validateRunning);
            memory.running = running;
        }
    },
    memory: (flag) => {
        if( !flag.memory.tasks ) flag.memory.tasks = {};
        // TODO: remove flag.memory.tasks.guard.name check
        if( !flag.memory.tasks.guard || flag.memory.tasks.guard.name ) flag.memory.tasks.guard = {};
        if( !flag.memory.tasks.guard.queued ) flag.memory.tasks.guard.queued = [];
        // TODO: remove isArray check
        if( !flag.memory.tasks.guard.spawning || !Array.isArray(flag.memory.tasks.guard.spawning)) flag.memory.tasks.guard.spawning = [];
        if( !flag.memory.tasks.guard.running ) flag.memory.tasks.guard.running = [];
        return flag.memory.tasks.guard;
    },
    checkForRequiredCreeps: (flag) => {
        let memory = Task.guard.memory(flag);
        // count creeps
        let count = memory.queued.length + memory.spawning.length + memory.running.length;
        // if creeps below requirement
        if( count < 1 ) {
            // add creep
            let room = Game.rooms[Room.bestSpawnRoomFor(flag)];
            let fixedBody = [ATTACK, MOVE];
            let multiBody = [TOUGH, ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE];
            let name = 'warrior-' + flag.name;

            let creep = {
                parts: Creep.Setup.compileBody(room, fixedBody, multiBody, true),
                name: name,
                setup: 'warrior',
                destiny: { task: "guard", flagName: flag.name }
            };

            room.spawnQueueMedium.push(creep);
            memory.queued.push({
                room: room.name,
                name: name
            });
        }
    }
};

module.exports = mod; 