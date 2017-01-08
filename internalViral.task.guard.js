var mod = {
    checkForRequiredCreeps: (flag) => {
        let memory = Task.guard.memory(flag);
        // count creeps
        let count = memory.queued.length + memory.spawning.length + memory.running.length;
        // if creeps below requirement
        if( count < 1 ) {
            // add creep
            let room = Room.bestSpawnRoomFor(flag.pos.roomName);
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