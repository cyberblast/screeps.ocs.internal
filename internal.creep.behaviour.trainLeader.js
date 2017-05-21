const mod = new Creep.Behaviour('trainLeader');
module.exports = mod;
const super_invalidAction = mod.invalidAction;
mod.invalidAction = function(creep) {
    const attackFlag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
    return super_invalidAction.call(this, creep) || 
        (creep.action.name === 'dismantling' && creep.pos.roomName !== attackFlag.pos.roomName);
};
mod.nextAction = function(creep) {
    const rallyFlag = Game.flags[creep.data.destiny.targetName];
    if (!rallyFlag) {
        return this.assignAction(creep, 'recycling');
    }
    const attackFlag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
    const dismantleFlag = FlagDir.find(FLAG_COLOR.destroy.dismantle, creep.pos);
    Population.registerCreepFlag(creep, rallyFlag);
    const trainLength = Task.train.trainLength(rallyFlag.memory.type) - 1;
    const followers = [];
    for (let i = 1; i < trainLength; i++) {
        const follower = Task.train.findMember(creep, i);
        if (follower) followers.push(follower);
    }
    const attackRoom = attackFlag && attackFlag.pos.roomName;
    const rallyRoom = rallyFlag && rallyFlag.pos.roomName;
    const trainAssembled = !_.some(followers, f => f.pos.roomName !== attackRoom && f.pos.roomName !== rallyRoom);

    if (!attackFlag || !trainAssembled || followers.length < trainLength - 1) {
        if (creep.pos.roomName !== rallyRoom) {
            Creep.action.travelling.assignRoom(creep, rallyRoom);
        } else if (creep.pos.getRangeTo(rallyFlag) > 1) {
            this.assignAction(creep, 'travelling', rallyFlag);
        } else {
            this.assignAction(creep, 'idle');
        }
    } else if (creep.pos.roomName !== attackRoom) {
        Creep.action.travelling.assignRoom(creep, attackRoom);
    } else if (dismantleFlag) {
        this.assignAction(creep, 'dismantling');
    } else if (creep.pos.getRangeTo(attackFlag) > 0) {
        creep.data.travelRange = 0;
        this.assignAction(creep, 'travelling', attackFlag);
    } else {
        this.assignAction(creep, 'idle');
    }
};
