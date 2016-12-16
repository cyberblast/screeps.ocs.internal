var mod = {
    register: () => {
        Flag.FlagFound.on(f => {
            if( f.color == FLAG_COLOR.invade.exploit.color && f.secondaryColor == FLAG_COLOR.invade.exploit.secondaryColor ){
                Task.remoteHauler.checkForRequiredCreeps(f);
            }
        });
    },
    handleNewCreep:(creep) => {
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            flag.memory.tasks[creep.data.destiny.task].name = creep.name;
            flag.memory.tasks[creep.data.destiny.task].spawning = 0;
        }
    },
    checkForRequiredCreeps: (flag) => {
        let carryPartsNeeded = 1;
        let extraHaulerNeeded = true;
        if( flag.memory.tasks && flag.memory.tasks.remoteHauler && flag.memory.tasks.remoteHauler.walkTime ) {
            let totalWalkTime = flag.memory.tasks.remoteHauler.walkTime * 2
            carryPartsNeeded = Math.ceil(totalWalkTime / 5);
            let task = 'remoteHauler.1';
            let i = 1;
            while( flag.memory.tasks[task] && flag.memory.tasks[task].name ) {
                let c = Game.creeps[flag.memory.tasks[task].name];
                _.filter(c.body, function(bp){return bp == CARRY;}).length;
                carryPartsNeeded -= _.filter(c.body, function(bp){return bp == CARRY;}).length;
                i++;
                task = 'remoteHauler.' + i;
            }
            if ( carryPartsNeeded <= 0 ) {
                extraHaulerNeeded 
            }
        }
        let destiny = { flagName: flag.name, task: "remoteHauler" };
        let existingCreep;
        if (flag.memory.tasks)
          existingCreep = flag.memory.tasks.remoteHauler;
        else
          flag.memory.tasks = {};
        if (existingCreep) {
            if (existingCreep.spawning)
                return;
            if (!Game.creeps[existingCreep.name]) {
                delete(flag.memory.tasks.remoteHauler);
                existingCreep = null;
            }
        }
        if (!existingCreep) {
            let spawnRoomName = Room.bestSpawnRoomFor(flag);
            destiny.roomName = spawnRoomName;
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
            flag.memory.tasks.remoteHauler = { spawnName: name, spawnRoom: spawnRoomName, spawning: 1 };
        }
    }
};

module.exports = mod; 