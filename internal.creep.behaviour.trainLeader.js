let mod = {};
module.exports = mod;
mod.name = 'trainLeader';
mod.run = function(creep) {
    const attackFlag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
    if (!creep.action || creep.action.name === 'idle' ||
        (creep.action.name === 'dismantling' && creep.pos.roomName !== attackFlag.pos.roomName)) {
        // Assign next Action
        this.nextAction(creep);
    }
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
};
mod.nextAction = function(creep) {
    const rallyFlag = Game.flags[creep.data.destiny.targetName];
    if (!rallyFlag) {
        return Creep.action.recycling.assign(creep);
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
            Creep.action.travelling.assign(creep, rallyFlag);
        } else {
            Creep.action.idle.assign(creep);
        }
    } else if (creep.pos.roomName !== attackRoom) {
        Creep.action.travelling.assignRoom(creep, attackRoom);
    } else if (dismantleFlag) {
        Creep.action.dismantling.assign(creep);
    } else if (creep.pos.getRangeTo(attackFlag) > 0) {
        creep.data.travelRange = 0;
        Creep.action.travelling.assign(creep, attackFlag);
    } else {
        Creep.action.idle.assign(creep);
    }
};
