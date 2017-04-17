let mod = {};
module.exports = mod;
mod.name = 'trainRanged';
mod.run = function(creep) {
    if (!creep.action || creep.action.name === 'idle') {
        // Assign next Action
        this.nextAction(creep);
    }
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }

    let hasRangedAttack = creep.hasActiveBodyparts(RANGED_ATTACK);
    if( hasRangedAttack ) {
        const targets = creep.pos.findInRange(creep.room.hostiles, 3);
        if(targets.length > 2) { // TODO: precalc damage dealt
            if(CHATTY) creep.say('MassAttack');
            creep.attackingRanged = creep.rangedMassAttack() == OK;
            return;
        } else {
            creep.attackingRanged = creep.rangedAttack(targets[0]) == OK;
        }
    }

};
mod.nextAction = function(creep) {
    const rallyFlag = Game.flags[creep.data.destiny.targetName];
    const attackFlag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
    if (!rallyFlag) {
        return Creep.action.recycling.assign(creep);
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
            Creep.action.travelling.assign(creep, rallyFlag);
        } else {
            Creep.action.idle.assign(creep);
        }
    } else if (creep.pos.getRangeTo(leadingCreep) > 1) {
        Creep.action.travelling.assign(creep, leadingCreep);
    } else {
        Creep.action.idle.assign(creep);
    }
};
