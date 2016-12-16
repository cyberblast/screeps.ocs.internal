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
            flag.memory.tasks[creep.data.destiny.task][creep.data.destiny.taskIndex].name = creep.name;
            flag.memory.tasks[creep.data.destiny.task][creep.data.destiny.taskIndex].spawning = 0;
        }
    },
    checkForRequiredCreeps: (flag) => {
        let taskName = "remoteHauler";
        let carryPartsNeeded = 1;
        let extraHaulerNeeded = true;
        if( flag.memory.tasks && flag.memory.tasks.remoteHauler && flag.memory.tasks.remoteHauler.walkTime ) {
            let carryParts;
            let totalWalkTime = flag.memory.tasks.remoteHauler.walkTime * 2
            carryPartsNeeded = Math.ceil(totalWalkTime / 5);
            let taskIndex = 1;
            while( flag.memory.tasks[taskName][taskIndex] && flag.memory.tasks[taskName][taskIndex].name ) {
                let c = Game.creeps[flag.memory.tasks[task].name];
                _.filter(c.body, function(bp){return bp == CARRY;}).length;
                carryParts += _.filter(c.body, function(bp){return bp == CARRY;}).length;
                taskIndex++;
                
            }
            if ( carryParts < carryPartsNeeded || flag.memory.tasks[taskName][taskIndex].spawning ) {
                extraHaulerNeeded = false;
            }
        }
        // store numRequired in flagName.
        // Flag1-10 is 10 creeps.
        //let stuff = flag.name.split('-');
        //numRequired = stuff[1] ? stuff[1] : 1;

       
        for(let index = 1; extraHaulerNeeded; index++){
            let destiny = { flagName: flag.name, task: taskName, taskIndex: index };
            let existingCreep;
            if (flag.memory.tasks && flag.memory.tasks[taskName])
                existingCreep = flag.memory.tasks[taskName][index];
            else {
                flag.memory.tasks = {};
                flag.memory.tasks[taskName] = {};
            }
            if (existingCreep) {
                if (existingCreep.spawning)
                    return;
                if (!Game.creeps[existingCreep.name]) {
                    delete(flag.memory.tasks[taskName]);
                    existingCreep = null;
                }
            }
            if (!existingCreep) {
                let spawnRoomName = Room.bestSpawnRoomFor(flag);
                let setup = 'remoteHauler';
                let fixedBody = [];
                let multiBody = [TOUGH, ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE];
                let body = Creep.Setup.compileBody(Game.rooms[spawnRoomName], fixedBody, multiBody, true);
                let name = setup + '-' + flag.name;
                Game.rooms[spawnRoomName].spawnQueueLow.push({
                    parts: body,
                    name: name,
                    setup: setup,
                    destiny: destiny
                });
                flag.memory.tasks[taskName][index] = { spawnName: name, spawnRoom: spawnRoomName, spawning: 1 };
                extraHaulerNeeded = false;
            }
        }
    }
};

module.exports = mod; 