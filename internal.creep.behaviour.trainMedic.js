const mod = new Creep.Behaviour('trainMedic');
module.exports = mod;
const super_run = mod.run;
mod.run = function(creep) {
    super_run.call(this, creep);
    Creep.behaviour.ranger.heal.call(this, creep);
};
mod.nextAction = function(creep) {
    const rallyFlag = Game.flags[creep.data.destiny.targetName];
    const attackFlag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
    if (!rallyFlag) {
        return this.assignAction(creep, 'recycling');
    }
    Population.registerCreepFlag(creep, rallyFlag);
    // find the creep ahead of us in the train
    const leadingCreep = Task.train.findLeading(creep);
    const leadingRoom = leadingCreep && leadingCreep.pos.roomName;
    const attackRoom = attackFlag && attackFlag.pos.roomName;
    const rallyRoom = rallyFlag && rallyFlag.pos.roomName;
    if (!leadingCreep || !(leadingRoom === rallyRoom || leadingRoom === attackRoom)) {
        if (creep.pos.roomName !== rallyRoom) {
            Creep.action.travelling.assignRoom(creep, rallyRoom);
        } else if (creep.pos.getRangeTo(rallyFlag) > 1) {
            this.assignAction(creep, 'travelling', rallyFlag);
        } else {
            this.assignAction(creep, 'idle');
        }
    } else if (creep.pos.getRangeTo(leadingCreep) > 1) {
        this.assignAction(creep, 'travelling', leadingCreep);
    } else {
        this.assignAction(creep, 'idle');
    }
};
