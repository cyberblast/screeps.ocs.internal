let mod = {};
module.exports = mod;
mod.name = 'trainHealer';
mod.run = function(creep) {
    if (!creep.action || creep.action.name === 'idle') {
        // Assign next Action
        this.nextAction(creep);
    }

    // Do some work
    if( creep.action ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }

    Creep.behaviour.ranger.heal(creep);
};
mod.nextAction = function(creep){
    let flag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);

    Population.registerCreepFlag(creep, flag);

    let target = Game.creeps[Creep.prototype.findGroupMemberByType("trainDestroyer", creep.data.flagName)];

    if(!flag && Creep.action.recycling.assign(creep)) {
        return;
    } else if(!target) {
        if(creep.pos.roomName != creep.data.homeRoom) {
            return Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
        } else {
            return Creep.action.idle.assign(creep);
        }
    } else {
        if (creep.pos.roomName === target.pos.roomName) {
            return Creep.action.travelling.assign(creep, target);
        } else {
            return Creep.action.travelling.assignRoom(creep, target.pos.roomName);
        }
    }
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            // // allow routing in and through hostile rooms
            // if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
            return options;
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};