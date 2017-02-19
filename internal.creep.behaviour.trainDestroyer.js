let mod = {};
module.exports = mod;
mod.name = 'trainDestroyer';
mod.run = function(creep) {
    // Assign next Action
    if (!creep.action || creep.action.name === 'idle') this.nextAction(creep);
    // Do some work
    if( creep.action ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
};
mod.nextAction = function(creep) {
    let target = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);

    Population.registerCreepFlag(creep, target);

    let trainHealer = Game.creeps[Creep.prototype.findGroupMemberByType("trainHealer", creep.data.flagName)];
    let trainTurret = Game.creeps[Creep.prototype.findGroupMemberByType("trainTurret", creep.data.flagName)];

    if( !target ) {
        return Creep.action.recycling.assign(creep);
    } else if( !trainHealer || !trainTurret ) {
        if( creep.pos.roomName != creep.data.homeRoom ) {
            return Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
        } else {
            return Creep.action.idle.assign(creep);
        }
    } else if( creep.pos.roomName === target.pos.roomName ) {
        const dismantleFlag = FlagDir.find(FLAG_COLOR.destroy.dismantle, creep.pos, true);
        if( dismantleFlag ) {
            return Creep.action.dismantling.assign(creep);
        }
    }
    if( creep.pos.getRangeTo(target) > 1 ) {
        return Creep.action.travelling.assign(creep, target);
    } else {
        Creep.action.idle.assign(creep);
    }
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            // allow routing in and through hostile rooms
            if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
            return options;
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};