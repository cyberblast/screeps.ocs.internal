var mod = {
    register: () => {
        Flag.FlagFound.on(f => {
            if( f.color == FLAG_COLOR.defense.color && f.secondaryColor == FLAG_COLOR.defense.secondaryColor ){
                Task.defense.checkForRequiredCreeps(f);
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
        let numRequired;

        // store numRequired in flagName.
        // Flag1-10 is 10 creeps.
        let stuff = flag.name.split('-');
        numRequired = stuff[1] ? stuff[1] : 1;

        for(let index = 1; index < numRequired; index++){
            let destiny = { flagName: flag.name, task: "defense." + index };
            let existingCreep;
            if (flag.memory.tasks && flag.memory.tasks.defense)
                existingCreep = flag.memory.tasks.defense.[index];
            else
                flag.memory.tasks.defense = {};
            if (existingCreep) {
                if (existingCreep.spawning)
                    return;
                if (!Game.creeps[existingCreep.name]) {
                    delete(flag.memory.tasks.defense.[index]);
                    existingCreep = null;
                }
            }
            if (!existingCreep) {
                let spawnRoomName = Room.bestSpawnRoomFor(flag);
                let setup = 'warrior';
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
                flag.memory.tasks.defense = { spawnName: name, spawnRoom: spawnRoomName, spawning: 1 };
            }
        }
    }
};

module.exports = mod; 