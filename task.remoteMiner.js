var mod = {
    register: () => {
        Flag.FlagFound.on(f => {
            if( f.color == FLAG_COLOR.invade.exploit.color && f.secondaryColor == FLAG_COLOR.invade.exploit.secondaryColor ){
                Task.remoteMiner.checkForRequiredCreeps(f);
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
        let destiny = { flagName: flag.name, task: "remoteMiner" };
        let existingCreep;
        if (flag.memory.tasks)
          existingCreep = flag.memory.tasks.exploit;
        else
          flag.memory.tasks = {};
        if (existingCreep) {
            if (existingCreep.spawning)
                return;
            if (!Game.creeps[existingCreep.name]) {
                delete(flag.memory.tasks.remoteMiner);
                existingCreep = null;
            }
        }
        if (!existingCreep) {
            let spawnRoomName = Room.bestSpawnRoomFor(flag);
            destiny.roomName = spawnRoomName;
            let setup = 'remoteMiner';
            let fixedBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
            let multiBody = [];
            let body = Creep.Setup.compileBody(Game.rooms[spawnRoomName], fixedBody, multiBody);
            let name = setup + '-' + flag.name;
            Game.rooms[spawnRoomName].spawnQueueHigh.push({
                parts: body,
                name: name,
                setup: setup,
                destiny: destiny
            });
            flag.memory.tasks.remoteMiner = { spawnName: name, spawnRoom: spawnRoomName, spawning: 1 };
        }
    }
};

module.exports = mod; 