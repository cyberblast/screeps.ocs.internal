var mod = {
    register: () => {
        Flag.found.on( flag => Task.remoteHauler.handleFlagFound(flag) );
        Creep.spawningStarted.on( params => Task.remoteHauler.handleSpawningStarted(params) );
        Creep.spawningCompleted.on( creep => Task.remoteHauler.handleSpawningCompleted(creep) );
        Creep.predictedRenewal.on( creep => Task.remoteHauler.handlePredictedRenewal(creep) );
    },
    handleFlagFound: flag => {
        if( flag.color == FLAG_COLOR.invade.exploit.color && flag.secondaryColor == FLAG_COLOR.invade.exploit.secondaryColor ){
            Task.remoteHauler.checkForRequiredCreeps(flag);
        }
    },
    handleSpawningStarted: params => { // params: {spawn: spawn.name, name: creep.name, destiny: creep.destiny}
        if ( !params.destiny || !params.destiny.task || params.destiny.task != 'remoteHauler' )
            return;
        let flag = Game.flags[params.destiny.flagName];
        if (flag) {
            let memory = Task.remoteHauler.memory(flag);
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
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != 'remoteHauler')
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            // TODO: implement better distance calculation
            creep.data.predictedRenewal = creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*50);

            let memory = Task.remoteHauler.memory(flag);
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
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != 'remoteHauler')
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            let memory = Task.remoteHauler.memory(flag);
            // validate running creeps
            let running = []
            let validateRunning = o => {
                let creep = Game.creeps[o];
                // invalidate old creeps for predicted spawning
                // TODO: better distance calculation
                if( creep && creep.data && creep.ticksToLive > (creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*50) ) ) {
                    running.push(o);
                }
            };
            memory.running.forEach(validateRunning);
            memory.running = _.uniq(running);
        }
    },
    memory: (flag) => {
        if( !flag.memory.tasks ) flag.memory.tasks = {};
        // TODO: remove flag.memory.tasks.remoteHauler.name check
        if( !flag.memory.tasks.remoteHauler || flag.memory.tasks.remoteHauler.name ) flag.memory.tasks.remoteHauler = {};
        if( !flag.memory.tasks.remoteHauler.queued ) flag.memory.tasks.remoteHauler.queued = [];
        // TODO: remove isArray check
        if( !flag.memory.tasks.remoteHauler.spawning || !Array.isArray(flag.memory.tasks.remoteHauler.spawning)) flag.memory.tasks.remoteHauler.spawning = [];
        if( !flag.memory.tasks.remoteHauler.running ) flag.memory.tasks.remoteHauler.running = [];
        return flag.memory.tasks.remoteHauler;
    },
    checkForRequiredCreeps: (flag) => {
        let taskName = "remoteHauler";
        let extraHaulerNeeded = false;
        let memory = Task.remoteHauler.memory(flag);
        let count = memory.running.length + memory.queued.length + memory.spawning.length;

        if( memory.walkTime && memory.queued.length < 1) {
            let totalWalkTime = memory.walkTime * 2
            let carryPartsNeeded = Math.ceil(totalWalkTime / 5);
            let creeps = [];

            let getCreepsSpawning = o => {
                let creep = Game.creeps[o.name];
                if (creep && creep.body) creeps.push(creep); 
            };
            let getCreepsRunning = o => {
                let creep = Game.creeps[o];
                if (creep && creep.body) creeps.push(creep); 
            }; 
            let sumCarry = creep => _.filter(creep.body, (bp) => bp.type == CARRY ).length;

            memory.spawning.forEach(getCreepsSpawning);
            memory.running.forEach(getCreepsRunning);
            
            let carryParts = _.sum(creeps, sumCarry);
       
            if ( carryParts < carryPartsNeeded ) extraHaulerNeeded = true;
        } else {
            if ( count < 1 ) extraHaulerNeeded = true; // No creeps, spawn a new one.
        }
        
        if (extraHaulerNeeded) {
            let room = Game.rooms[Room.bestSpawnRoomFor(flag)];
            let fixedBody = [];
            let multiBody = [CARRY, CARRY, MOVE];
            let name = taskName + '-' + flag.name;

            let parts = Creep.Setup.compileBody(room, fixedBody, multiBody, true);
            let creep = {
                parts: parts,
                name: name,
                setup: taskName,
                destiny: { task: taskName, flagName: flag.name }
            };

            room.spawnQueueLow.push(creep);
            memory.queued.push({
                room: room.name,
                name: name
            });
        }      
    }
};

module.exports = mod; 