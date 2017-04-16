let mod = {};
module.exports = mod;
mod.name = 'hopper';
mod.actionInvalid = function(creep, action) {
    const flag = mod.getFlag(creep);
    if (creep.hits === creep.hitsMax) {
        // target, or nearest
        const hopTarget = Game.flags[creep.data.destiny.targetName] || FlagDir.find(FLAG_COLOR.hopper, creep.pos, false);
        // if we're fully healed, but not moving towards the hopper flag, or we've arrived in the target room
        const ret = hopTarget && action.name === 'travelling' &&
            (!creep.target ||
                (!creep.target.name || creep.target.pos.roomName !== hopTarget.pos.roomName)
            );
        return ret;
    } else if (action.name === 'travelling' && flag && creep.data.travelRoom !== flag.pos.roomName) {
        return true;
    }
    return false;
};
mod.run = function(creep) {
    if (!Creep.action.avoiding.run(creep)) {
        // Assign next Action
        if (!creep.action || creep.action.name === 'idle' || mod.actionInvalid(creep, creep.action)) {
            this.nextAction(creep);
        }
        // Do some work
        if( creep.action && creep.target ) {
            creep.action.step(creep);
        } else {
            logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
        }
    }
    Creep.behaviour.ranger.heal(creep);
};
mod.goTo = function(creep, flag) {
    if (creep.pos.roomName !== flag.pos.roomName) {
        creep.data.travelRange = 23; // stay next to the border
        return Creep.action.travelling.assignRoom(creep, flag.pos.roomName);
    } else if (creep.pos.getRangeTo(flag) > 0) {
        creep.data.travelRange = 0;
        return Creep.action.travelling.assign(creep, flag);
    } else {
        return Creep.action.idle.assign(creep);
    }
};
mod.getFlag = function(creep) {
    return Game.flags[creep.data.destiny.targetName] || FlagDir.find(FLAG_COLOR.hopper, creep.pos, false);
};
mod.nextAction = function(creep, oldTargetId){
    const hopTarget = mod.getFlag(creep);
    // no hopper flag found
    if( !hopTarget ) {
        // recycle self if no target (TODO closest spawn)
        return Creep.action.recycling.assign(creep, Game.spawns[creep.data.motherSpawn]);
    }

    const homeTarget = FlagDir.find(FLAG_COLOR.hopperHome, hopTarget.pos, false);
    if (homeTarget && creep.pos.roomName !== homeTarget.pos.roomName && creep.pos.roomName !== hopTarget.pos.roomName) {
        // go through the heal flag on initial approach
        return mod.goTo(creep, homeTarget);
    } 
    if (creep.hits === creep.hitsMax) { // hop
        Population.registerCreepFlag(creep, hopTarget);
        return mod.goTo(creep, hopTarget);
    } else { // heal
        if (homeTarget) {
            return mod.goTo(creep, homeTarget);
        } else {
            // change this so the hopper exits using the nearest exit on the way to the homeRoom and then stops just inside that room to heal
            return Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
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