let mod = {};
module.exports = mod;
mod.name = 'hopper';
mod.run = function(creep) { 
    // Assign next Action
    this.nextAction(creep);
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
    // no hopper flag found
    if( !hopperTarget ) {
            // recycle self if no target
        let mother = Game.spawns[creep.data.motherSpawn];
        if( mother ) {
        Creep.action.recycling.assign(creep, mother);
            return;
        }
    }
    // only move to target room at full HP & not at target room 
    else if (creep.hits === creep.hitsMax && creep.pos.roomName != hopperTarget.pos.roomName) {
        // go to target room (hopper)
        target = hopperTarget;
        Population.registerCreepFlag(creep, target);
    }
    // at target room 
    else {
        // stay a while
        if( creep.hits < (creep.hitsMax * 0.6) || !creep.hasActiveBodyparts(TOUGH) ) {
            // go to hide room (hopperHome)
            target= FlagDir.find(FLAG_COLOR.hopperHome, creep.pos, false);
            if( !target ) target = Game.rooms[creep.data.homeRoom].controller;   
        }
    }
    
                // a target has been specified. check if it needs to be assigned (may be already assigned)
    if( target && creep.data.targetId != (target.id || target.name)) { //
        delete creep.data.path;
        Creep.action.travelling.assign(creep, target);
    } else if (!creep.action) { 
        // no new target specified and travelling completed (e.g. flag reached but now staying a while)
        Creep.action.idle.assign(creep);
    } // else keep old target and action
};
