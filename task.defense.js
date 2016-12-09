var mod = {
    checkForRequiredCreeps: () => {
        let flagEntries = FlagDir.filter(FLAG_COLOR.defense);
        flagEntries.forEach(function (flagEntry) {
            let flag = Game.flags[flagEntry.name];
            let destiny = flagEntry.name;
            let existingWarrior = Population.findCreepDestiny("warrior", destiny);
            if (!existingWarrior) {
                let spawnRoomName = Room.bestSpawnRoomFor(flag);
                let setup = 'warrior';
                let fixedBody = [];
                let multiBody = [TOUGH, ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE];
                let body = Task.bodyparts(Game.rooms[spawnRoomName], fixedBody, multiBody);
                let name = setup + '-' + flag.name;
                Game.rooms[spawnRoomName].spawnQueueHigh.push({
                    parts: body,
                    name: name,
                    setup: setup,
                    destiny: destiny
                });
                console.log(destiny + ": " + flag.name + " - " + spawnRoomName + " : " + JSON.stringify(Game.rooms[spawnRoomName].spawnQueueHigh[Game.rooms[spawnRoomName].spawnQueueHigh.length-1]));
            }
        });
    }
};

module.exports = mod;