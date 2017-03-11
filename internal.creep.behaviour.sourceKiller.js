let mod = {};
module.exports = mod;
mod.name = 'warrior';
mod.run = function(creep) {
    creep.flee = creep.flee || !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK]);
    creep.attacking = false;
    creep.attackingRanged = false;
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if( creep.action == null || creep.action.name == 'idle' || ( creep.action.name == 'sourceKiller' && (!creep.flag || creep.flag.pos.roomName == creep.pos.roomName ) ) ) {
        this.nextAction(creep);
    }
    if( creep.data.targetId != oldTargetId ) {
        delete creep.data.path;
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
