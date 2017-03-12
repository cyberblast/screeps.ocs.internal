let mod = {};
module.exports = mod;
mod.name = 'hopper';
mod.actionInvalid = function(creep, action) {
    if (creep.hits === creep.hitsMax) {
        const hopperTarget = FlagDir.find(FLAG_COLOR.hopper, creep.pos, false); // nearest hopper flag
        // if we're fully healed, but not moving towards the hopper flag, or we've arrived in the target room
        let ret = hopperTarget && action.name === 'travelling' &&
            (!creep.target ||
                (!creep.target.name || creep.target.pos.roomName !== hopperTarget.pos.roomName)
            );
        return ret;
    }
    return false;
};
mod.run = function(creep) {
    if (Creep.action.avoiding.run(creep)) {
        return;
    }

    // Assign next Action
    const hopperTarget = FlagDir.find(FLAG_COLOR.hopper, creep.pos, false); // nearest hopper flag
    if (!creep.action || creep.action.name === 'idle' || mod.actionInvalid(creep, creep.action)) {
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
mod.nextAction = function(creep, oldTargetId){
    let target = null;
    let hopperTarget = FlagDir.find(FLAG_COLOR.hopper, creep.pos, false); // nearest hopper flag
    let mother = Game.spawns[creep.data.motherSpawn];
    // no hopper flag found
    if( !hopperTarget ) {
        // recycle self if no target (TODO closest spawn)
        return Creep.action.recycling.assign(creep, mother);
    }

    let travelTarget = !creep.flag && hopperTarget && FlagDir.find(FLAG_COLOR.hopperHome, hopperTarget.pos, false);
    if (travelTarget && creep.pos.roomName !== travelTarget.pos.roomName) {
        creep.data.travelRange = TRAVELLING_BORDER_RANGE;
        return Creep.action.travelling.assignRoom(creep, travelTarget.pos.roomName);
    }

    // only move to target room at full HP & not at target room
    if (creep.hits === creep.hitsMax && creep.pos.roomName != hopperTarget.pos.roomName) {
        // go to target room (hopper)
        Population.registerCreepFlag(creep, hopperTarget);
        creep.data.travelRange = 23; // stay next to the border
        return Creep.action.travelling.assignRoom(creep, hopperTarget.pos.roomName);
    } else {
        // at target room, so stay a while
        if( creep.hits < (creep.hitsMax * 0.6) || !creep.hasActiveBodyparts(TOUGH) ) {
            // go to hide room (hopperHome)
            const hopperHome = FlagDir.find(FLAG_COLOR.hopperHome, creep.pos, false);
            if (hopperHome) return Creep.action.travelling.assign(creep, hopperHome);
            else return Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
        }
    }
    // no new target specified and travelling completed (e.g. flag reached but now staying a while)
    Creep.action.idle.assign(creep);
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