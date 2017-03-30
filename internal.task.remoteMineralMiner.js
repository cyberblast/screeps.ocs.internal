const mod = new Task('remoteMineralMiner');
module.exports = mod;
mod.minControllerLevel = 2;
mod.maxCount = flag => {
    if (!flag.room) return 1;
    let max = 0;
    flag.room.minerals.forEach(mineral => {
        if (mineral.mineralAmount > 0) max++;
    });
    return max;
};
mod.name = 'remoteMineralMiner';
mod.checkValidRoom = flag => {
    return Room.isCenterNineRoom(flag.pos.roomName);
};
mod.handleFlagFound = flag => {
    if (Task.mining.checkFlag(flag) && Task.remoteMineralMiner.checkValidRoom(flag)) {
        Task.remoteMineralMiner.checkForRequiredCreeps(flag);
    }
};
mod.fieldOrFunction = (flag, value) => {
    return typeof value === 'function' ? value(flag) : value;
};
mod.checkForRequiredCreeps = flag => {
    const roomName = flag.pos.roomName;
    const flagName = flag.name;
    const room = Game.rooms[roomName];
    
    const type = mod.name;
    
    const memory = Task.remoteMineralMiner.memory(roomName);
    
    if (memory.nextSpawnCheck[type] && Game.time > memory.nextSpawnCheck[type]) {
        if (DEBUG && TRACE) trace('Task', {Task: mod.name, roomName, flagName, [mod.name]: 'Flag.found', 'Flag.found': 'revalidating', revalidating: type});
        Task.remoteMineralMiner.validateSpawning(roomName, type);
    }
    
    let invalidEntry;
    let running = _.map(memory.running[type], n => {
        const c = Game.creeps[n];
        if (!c) invalidEntry = true;
        return c;
    });
    if (invalidEntry) {
        if (DEBUG && TRACE) trace('Task', {Task: mod.name, roomName, flagName, [mod.name]: 'Flag.found', 'Flag.found': 'revalidating', revalidating: type});
        mod.validateRunning(roomName, type);
        running = _.map(memory.running[mod.name], n => Game.creeps[n]);
    }
    const runningCount = _.filter(running, c => !Task.remoteMineralMiner.needsReplacement(c)).length;
    const mineralMinerCount = memory.queued[type].length + memory.spawning[type].length + runningCount;
    
    if(DEBUG && TRACE) trace('Task', {Task: mod.name, flagName, mineralMinerCount, [mod.name]: 'Flag.found'}, 'checking flag@', flag.pos);
    
    if (mineralMinerCount < Task.remoteMineralMiner.fieldOrFunction(flag, mod.maxCount)) {
        if (DEBUG && TRACE) trace('Task', {Task: mod.name, room: roomName, mineralMinerCount, mineralMinerTTLs: _.map(_.map(memory.running.remoteMineralMiner, n => Game.creeps[n]), 'ticksToLive'), [mod.name]: 'mineralMinerCount'});
        
        const mineralMiner = mod.setupCreep(roomName, Task.remoteMineralMiner.creep);
        
        for (let i = mineralMinerCount; i < Task.remoteMineralMiner.fieldOrFunction(flag, mod.maxCount); i++) {
            Task.spawn(
                mineralMiner,
                {
                    task: mod.name,
                    targetName: flag.name,
                    type: Task.remoteMineralMiner.creep.behaviour,
                },
                {
                    targetRoom: roomName,
                    minEnergyCapacity: 550,
                    rangeRclRatio: 1,
                },
                creepSetup => {
                    const memory = Task.remoteMineralMiner.memory(creepSetup.destiny.room);
                    memory.queued[creepSetup.behaviour].push({
                        room: creepSetup.queueRoom,
                        name: creepSetup.name,
                    });
                }
            );
        }
    }
};
mod.handleSpawningStarted = params => {
    if (!params.destiny || !params.destiny.task || params.destiny.task !== mod.name) return;
    const memory = Task.remoteMineralMiner.memory(params.destiny.room);
    if (memory.queued[params.destiny.type]) {
        memory.queued[params.destiny.type].pop();
    } else if (params.destiny.role) {
        if (params.destiny.role === 'remoteMineralMiner') params.destiny.type = 'remoteMineralMiner';
        memory.queued[params.destiny.type].pop();
    }
    if (params.body) params.body = _.countBy(params.body);
    memory.spawning[params.destiny.type].push(params);
    const nextCheck = memory.nextSpawnCheck[params.destiny.type];
    if (!nextCheck || (Game.time + params.spawnTime) < nextCheck) memory.nextSpawnCheck[params.destiny.type] = Game.time + params.spawnTime + 1;
};
mod.handleSpawningCompleted = creep => {
    if (!creep.data.destiny || !creep.data.destiny.task || creep.data.destiny.task !== mod.name) {
        return;
    }
    if (creep.data.destiny.homeRoom) {
        creep.data.homeRoom = creep.data.destiny.homeRoom;
    }
    
    creep.data.predictedRenewal = creep.data.spawningTime + routeRange(creep.data.homeRoom, creep.data.destiny.room) * 50;
    
    const memory = Task.remoteMineralMiner.memory(creep.data.destiny.room);
    
    memory.running[creep.data.destiny.type].push(creep.name);
    
    Task.remoteMineralMiner.validateSpawning(creep.data.destiny.room, creep.data.destiny.type);
};
mod.handleCreepDied = name => {
    const mem = Memory.population[name];
    
    if (!mem || !mem.destiny || !mem.destiny.task || mem.destiny.task !== mod.name) return;
    
    Task.remoteMineralMiner.validateRunning(mem.destiny.room, mem.creepType, name);
};
mod.validateSpawning = (roomName, type) => {
    const memory = Task.remoteMineralMiner.memory(roomName);
    const spawning = [];
    let minRemaining;
    const _validateSpawning = o => {
        const spawn = Game.spawns[o.spawn];
        if (spawn && ((spawn.spawning && spawn.spawning.name === o.name) || (spawn.newSpawn && spawn.newSpawn.name === o.name))) {
            minRemaining = (!minRemaining || spawn.spawning.remainingtime < minRemaining) ? spawn.spawning.remainingTime : minRemaining;
            spawning.push(o);
        }
    };
    if (memory.spawning[type]) {
        memory.spawning[type].forEach(_validateSpawning);
    }
    memory.spawning[type] = spawning;
    memory.nextSpawnCheck[type] = minRemaining ? Game.time + minRemaining : 0;
};
mod.validateRunning = (roomName, type, name) => {
    const memory = Task.remoteMineralMiner.memory(roomName);
    const running = [];
    const _validateRunning = o => {
        const creep = Game.creeps[o];
        if (!creep || !creep.data) return;
        
        let prediction = (routeRange(creep.data.homeRoom, roomName) + 1) * 50;
        if (creep.data.predictedRenewal) {
            prediction = creep.data.predictedRenewal;
        } else if (creep.data.spawningTime) {
            prediction = creep.data.spawningTime + routeRange(creep.data.homeRoom, roomName) * 50;
        }
        if ((!name || creep.name !== name) && creep.ticksToLive > prediction) running.push(o);
    };
    if (memory.running[type]) memory.running[type].forEach(_validateRunning);
    memory.running[type] = running;
};
mod.needsReplacement = creep => {
    return !creep || (creep.ticksToLive || CREEP_LIFE_TIME) < (creep.data.predictedRenewal || 0);
};
mod.findSpawning = (roomName, type) => {
    const spawning = [];
    _(Game.spawns)
        .filter(s => s.spawning && (_.includes(s.spawning.name, type) || (s.newSpawn && _.includes(s.newSpawn.name, type))))
        .forEach(s => {
            const c = Population.getCreep(s.spawning.name);
            if (c && c.destiny.room === roomName) {
                spawning.push({
                    spawn: s.name,
                    name: s.spawning.name,
                    destiny: c.name,
                });
            }
        });
    return spawning;
};
mod.findRunning = (roomName, type) => {
    return _(Game.creeps)
        .filter(c => !c.spawning && c.data && c.data.creepType === type && c.data.destiny && c.data.destiny.room === roomName)
        .map(c => c.name);
};
mod.memory = key => {
    const memory = Task.memory(mod.name, key);
    if (!Reflect.has(memory, 'queued')) {
        memory.queued = {
            remoteMineralMiner: [],
        };
    }
    if (!Reflect.has(memory, 'spawning')) {
        memory.spawning = {
            remoteMineralMiner: Task.remoteMineralMiner.findSpawning(key, 'remoteMineralMiner'),
        };
    }
    if (!Reflect.has(memory, 'running')) {
        memory.running = {
            remoteMineralMiner: Task.remoteMineralMiner.findRunning(key, 'remoteMineralMiner'),
        };
    }
    if (!Reflect.has(memory, 'nextSpawnCheck')) {
        memory.nextSpawnCheck = {};
    }
    return memory;
};
mod.creep = {
    fixedBody: [WORK, WORK, WORK, CARRY, MOVE],
    multiBody: [WORK, WORK, WORK, MOVE],
    minMulti: 1,
    maxMulti: 11,
    behaviour: 'remoteMineralMiner',
    queue: 'Low',
};
mod.setupCreep = (roomName, definition) => {
    const memory = Task.remoteMineralMiner.memory(roomName);
    if (!memory.harvestSize) {
        return definition;
    }
    
    const isWork = b => b === WORK;
    const baseBody = _.reject(definition.fixedBody, isWork);
    const workParts = _.sum(definition.fixedBody, isWork) + memory.harvestSize;
    
    return _.create(definition, {
        fixedBody: _.times(workParts, _.constant(WORK))
            .concat(_.times(Math.ceil(memory.harvestSize * 0.5), _.constant(MOVE)))
            .concat(baseBody),
        moveBalance: (memory.havestSize % 2) * -0.5,
    });
};