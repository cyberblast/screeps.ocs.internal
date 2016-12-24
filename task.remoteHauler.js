var mod = {
    name: 'remoteHauler',
    register: () => {
        Flag.found.on( flag => Task.remoteHauler.handleFlagFound(flag) );
        Creep.spawningStarted.on( params => Task.remoteHauler.handleSpawningStarted(params) );
        Creep.spawningCompleted.on( creep => Task.remoteHauler.handleSpawningCompleted(creep) );
        Creep.predictedRenewal.on( creep => Task.remoteHauler.handlePredictedRenewal(creep) );
        Creep.died.on(creepData => Task.remoteHauler.handleDied(creepData) );
    },
    handleFlagFound: flag => {
        if( flag.color == FLAG_COLOR.invade.exploit.color && flag.secondaryColor == FLAG_COLOR.invade.exploit.secondaryColor ){
            Task.remoteHauler.checkForRequiredCreeps(flag);
        }
    },
    handleSpawningStarted: params => { // params: {spawn: spawn.name, name: creep.name, destiny: creep.destiny}
        if ( !params.destiny || !params.destiny.task || params.destiny.task != Task.remoteHauler.name )
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
                if(room.spawnQueueLow.some( c => c.name == o.name)){
                    queued.push(o);
                }
            };
            memory.queued.forEach(validateQueued);
            memory.queued = queued;
        }
    },
    handleSpawningCompleted: creep => {
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != Task.remoteHauler.name )
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            let memory = Task.remoteHauler.memory(flag);

            // TODO: implement better distance calculation
            creep.data.predictedRenewal = creep.data.spawningTime + memory.walkTime;
            // add to running creeps
            memory.running.push(creep.name);

            // validate spawning creeps
            let spawning = []
            let validateSpawning = o => {
                let spawn = Game.spawns[o.spawn];
                if( spawn && ((spawn.spawning && spawn.spawning.name == o.name) || (spawn.newSpawn && spawn.newSpawn.name == o.name))) {
                    spawning.push(o);
                }
            };
            memory.spawning.forEach(validateSpawning);
            memory.spawning = spawning;
        }
    },
    handlePredictedRenewal: creep => {
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != Task.remoteHauler.name )
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
                if( !creep.data || (creep && creep.ticksToLive > (creep.data.spawningTime + memory.walkTime )) ) {
                    running.push(o);
                }
            };
            memory.running.forEach(validateRunning);
            memory.running = _.uniq(running);
        }
    },
    handleDied: creepData => {
        if ( !creepData || !creepData.destiny || !creepData.destiny.task || creepData.destiny.task != Task.remoteHauler.name) 
            return;
        let flag = Game.flags[creepData.destiny.flagName];
        if (flag) {
            let memory = Task.remoteHauler.memory(flag);
            let index = memory.running.indexOf(creepData.name);
            if (index > -1) {
                memory.running.splice(index, 1);
            }
        }
    },
    memory: (flag) => {
        let memory = Task.memory(Task.remoteHauler.name, flag.name);
        if( !memory.queued ) memory.queued = [];
        if( !memory.spawning ) memory.spawning = [];
        if( !memory.running ) memory.running = [];
        return memory;
    },
    checkForRequiredCreeps: (flag) => {
        let extraHaulerNeeded = false;
        let memory = Task.remoteHauler.memory(flag);

        // count creeps
        let count = memory.running.length + memory.queued.length + memory.spawning.length;

        // Count sources and add more creeps to fill every source
        let sourcesCount = 1; 
        if (flag.room && flag.room.sources) 
            sourcesCount = flag.room.sources.length;

        if( memory.walkTime && memory.queued.length < 1) {
            // Add a better calculation for carry parts.
            let totalWalkTime = memory.walkTime * sourcesCount * 2;
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
            if ( count < sourcesCount ) extraHaulerNeeded = true; // No creeps or less than sourcesCount, then spawn a new one.
        }
        
        if (extraHaulerNeeded) {
            let room = Game.rooms[Room.bestSpawnRoomFor(flag)];
            let fixedBody = [];
            let multiBody = [CARRY, CARRY, MOVE];
            let name = Task.remoteHauler.name + '-' + flag.name;

            console.log("Added hauler to queue:" + name);
            let parts = Creep.Setup.compileBody(room, fixedBody, multiBody, true);
            let creep = {
                parts: parts,
                name: name,
                setup: Task.remoteHauler.name,
                destiny: { task: Task.remoteHauler.name, flagName: flag.name }
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