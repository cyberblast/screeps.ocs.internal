var mod = {
    register: () => {
        Flag.FlagFound.on(f => {
            if( f.color == FLAG_COLOR.defense.color && f.secondaryColor == FLAG_COLOR.defense.secondaryColor ){
                Task.guard.checkForRequiredCreeps(f);
            }
        });
    },
    handleNewCreep:(creep) => {
        let flag = Game.flags[creep.data.destiny.flagName];
        if (flag) {
            flag.memory.tasks.guard.name = creep.name;
            flag.memory.tasks.guard.spawning = 0;
        }
    },
    checkForRequiredCreeps: (flag) => {
        let destiny = { flagName: flag.name, task: "guard" };
        let existingWarrior;
        if (flag.memory.tasks) {
            // temporary migration: begin
            if( flag.memory.tasks.defense ) {
                flag.memory.tasks.guard = _.clone(flag.memory.tasks.defense, true);
                delete flag.memory.tasks.defense;
            }
            // temporary migration: end
            existingWarrior = flag.memory.tasks.guard;
        }
        else flag.memory.tasks = {};
        if (existingWarrior) {
            if (existingWarrior.spawning)
                return;
            if (!Game.creeps[existingWarrior.name]) {
                delete(flag.memory.tasks.guard);
                existingWarrior = null;
            }
        }
        if (!existingWarrior) {
            let spawnRoomName = Room.bestSpawnRoomFor(flag);
            let setup = 'warrior';
            let fixedBody = [ATTACK, MOVE];
            let multiBody = [TOUGH, ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE];
            let body = Creep.Setup.compileBody(Game.rooms[spawnRoomName], fixedBody, multiBody, true);
            let name = setup + '-' + flag.name;
            Game.rooms[spawnRoomName].spawnQueueLow.push({
                parts: body,
                name: name,
                setup: setup,
                destiny: destiny
            });
            flag.memory.tasks.guard = { spawnName: name, spawnRoom: spawnRoomName, spawning: 1 };
        }
    }
};

module.exports = mod; 