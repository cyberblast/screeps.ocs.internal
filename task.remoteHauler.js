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
        // TODO: remove flag.memory.tasks.remoteHauler.name check
        if( !flag.memory.tasks.remoteHauler || flag.memory.tasks.remoteHauler.name ) flag.memory.tasks.remoteHauler = {};
        if( !flag.memory.tasks.remoteHauler.queued ) flag.memory.tasks.remoteHauler.queued = [];
        // TODO: remove isArray check
        if( !flag.memory.tasks.remoteHauler.spawning || !Array.isArray(flag.memory.tasks.remoteHauler.spawning)) flag.memory.tasks.remoteHauler.spawning = [];
        if( !flag.memory.tasks.remoteHauler.running ) flag.memory.tasks.remoteHauler.running = [];
        return flag.memory.tasks.remoteHauler;
    },
    checkForRequiredCreeps: (flag) => {
        let memory = Task.remoteHauler.memory(flag);
        let taskName = "remoteHauler";
        let carryPartsNeeded = 1;
        let extraHaulerNeeded = true;
        let noWalkTime;
        if( memory.walkTime ) {
            let carryParts = 0;
            let totalWalkTime = memory.walkTime * 2
            carryPartsNeeded = Math.ceil(totalWalkTime / 5);
            let taskIndex = 1;
            while( memory && memory[taskIndex].name ) {
                let c = Game.creeps[memory[taskIndex].name];
                if( c )
                    carryParts += _.filter(c.body, function(bp){return bp.type == CARRY;}).length;
                taskIndex++;
                
            }
            if ( carryParts > carryPartsNeeded || (memory[taskIndex] && memory[taskIndex].spawning) ) {
                extraHaulerNeeded = false;
            }
        } else {
            noWalkTime = true;
        }
        // store numRequired in flagName.
        // Flag1-10 is 10 creeps.
        //let stuff = flag.name.split('-');
        //numRequired = stuff[1] ? stuff[1] : 1;

        for(let index = 1; extraHaulerNeeded; index++){
            let destiny = { flagName: flag.name, task: taskName, taskIndex: index };
            let existingCreep;
            existingCreep = memory[index];
            if (existingCreep) {
                if (existingCreep.spawning)
                    return;
                if (!Game.creeps[existingCreep.name]) {
                    delete(memory[index]);
                    existingCreep = null;
                }
            }
            if (!existingCreep) {
                let spawnRoomName = Room.bestSpawnRoomFor(flag);
                let setup = 'remoteHauler';
                let fixedBody = [WORK];
                let multiBody = [CARRY, CARRY, MOVE];
                let body = Creep.Setup.compileBody(Game.rooms[spawnRoomName], fixedBody, multiBody);
                let name = setup + '-' + flag.name;
                Game.rooms[spawnRoomName].spawnQueueLow.push({
                    parts: body,
                    name: name,
                    setup: setup,
                    destiny: destiny
                });
                memory[index] = { spawnName: name, spawnRoom: spawnRoomName, spawning: 1 };
                memory.queued.push({
                    room: room.name,
                    name: name
                });
                extraHaulerNeeded = false;
            }
            if (noWalkTime)
                extraHaulerNeeded = false;
        }
    }
};

module.exports = mod; 