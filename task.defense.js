var mod = {
    checkForRequiredCreeps: () => {
        let flagEntries = FlagDir.filter(FLAG_COLOR.defense);
        flagEntries.forEach(function (flagEntry) {
            let flag = Game.flags[flagEntry.name];
            let destiny = flagEntry.name;
            let existingWarrior = Population.findCreepDestiny("warrior", destiny);
            console.log(existingWarrior);
            if (!existingWarrior) {
                let spawnRoomName = Room.bestSpawnRoomFor(flag);
                let setup = 'warrior';
                let parts = [RANGED_ATTACK,MOVE,RANGED_ATTACK,MOVE,HEAL,MOVE];
//    multiBody: [RANGED_ATTACK, MOVE],                
                let name = setup + '-' + flag.name;
                Game.rooms[spawnRoomName].spawnQueueHigh.push({
                    parts: parts,
                    name: name,
                    setup: setup,
                    destiny: destiny
                });
                console.log(destiny + ": " + flag.name + " - " + spawnRoomName);
            }
        });
    }
};

module.exports = mod;