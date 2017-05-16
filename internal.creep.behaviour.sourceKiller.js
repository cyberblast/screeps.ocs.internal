let mod = {};
module.exports = mod;
mod.name = 'sourceKiller';
mod.run = function(creep) {
    if (creep.flag && !creep.data.predictedRenewal) {
        creep.data.predictedRenewal = creep.data.spawningTime + 50 + 50 * routeRange(creep.data.homeRoom, creep.flag.pos.roomName);
    }
    creep.flee = creep.flee || !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK]);
    creep.attacking = false;
    creep.attackingRanged = false;
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if( creep.action == null || creep.action.name == 'idle' ) {
        this.nextAction(creep);
    }
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }

    Creep.behaviour.ranger.heal(creep);
};
mod.nextAction = function(creep){
    const flag = creep.flag || Game.flags[creep.data.destiny.targetName];
    if (!flag) return Creep.action.recycling.assign(creep);
    if (creep.pos.roomName !== flag.pos.roomName) return Creep.action.travelling.assignRoom(creep, flag.pos.roomName);
    let priority = [
        Creep.action.defending,
        Creep.action.sourceKiller,
        Creep.action.idle
    ];
    for(var iAction = 0; iAction < priority.length; iAction++) {
        var action = priority[iAction];
        if(action.isValidAction(creep) &&
            action.isAddableAction(creep) &&
            action.assign(creep)) {
                return;
        }
    }
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            options.avoidSKCreeps = false;
            return options;
        },
    },
    defending: {
        targetFilter: function(creep) {
            return function (hostile) {
                return true;
            }
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};
