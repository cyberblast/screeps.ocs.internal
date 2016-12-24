var mod = {
    name: 'remoteMiner',
    register: () => {
        Flag.found.on( flag => Task.remoteMiner.handleFlagFound(flag) );
        Creep.spawningStarted.on( params => Task.remoteMiner.handleSpawningStarted(params) );
        Creep.spawningCompleted.on( creep => Task.remoteMiner.handleSpawningCompleted(creep) );
        Creep.predictedRenewal.on( creep => Task.remoteMiner.handlePredictedRenewal(creep) );
        Creep.died.on(creepData => Task.remoteMiner.handleDied(creepData) );
    },
    handleFlagFound: flag => {
        if( flag.color == FLAG_COLOR.invade.exploit.color && flag.secondaryColor == FLAG_COLOR.invade.exploit.secondaryColor ){
            Task.remoteMiner.checkForRequiredCreeps(flag);
        }
    },
    handleSpawningStarted: params => { // params: {spawn: spawn.name, name: creep.name, destiny: creep.destiny}
        if ( !params.destiny || !params.destiny.task || params.destiny.task != this.name )
            return;
        let flag = Game.flags[params.destiny.flagName];
        if (flag) {
            let memory = this.memory(flag);
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
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != this.name)
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            // TODO: implement better distance calculation
            creep.data.predictedRenewal = creep.data.spawningTime + (routeRange(creep.data.homeRoom, flag.pos.roomName)*50);

            let memory = this.memory(flag);
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
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task != this.name)
            return;
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            let memory = this.memory(flag);
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
    handleDied: creepData => {
        if ( !creepData || !creepData.destiny || creepData.destiny.task || creepData.destiny.task != this.name) 
            return;
        let flag = Game.flags[creepData.destiny.flagName];
        if (flag) {
            let memory = this.memory(flag);
            let index = memory.running.indexOf(creepData.name);
            if (index > -1) {
                console.log("removing miner from memory");
                memory.running.splice(index, 1);
            } else {
                console.log("error removing miner from memory");
            }
        }
    },
    memory: (flag) => {
        let memory = Task.memory(this.name, flag.name);
        if( !memory.queued ) memory.queued = [];
        if( !memory.spawning ) memory.spawning = [];
        if( !memory.running ) memory.running = [];
        return flag.memory.tasks.remoteHauler;
    },
    checkForRequiredCreeps: (flag) => {
        let memory = this.memory(flag);

        // count creeps
        let count = memory.queued.length + memory.spawning.length + memory.running.length;

        // Add more creeps if there are more sources in room.
        let sourcesCount = 1; 
        if (flag.room && flag.room.sources) 
            sourcesCount = flag.room.sources.length;
        
        // if creeps below requirement
        if( count < sourcesCount) {
            // add creep
            let room = Game.rooms[Room.bestSpawnRoomFor(flag)];
            let fixedBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
            let multiBody = [];
            let name = this.name + '-' + flag.name;

            console.log("Added miner to queue:" + name);
            let creep = {
                parts: Creep.Setup.compileBody(room, fixedBody, multiBody),
                name: name,
                setup: this.name,
                destiny: { task: this.name, flagName: flag.name }
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