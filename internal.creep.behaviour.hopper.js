module.exports = {
    name: 'hopper',
    run: function(creep) { 
        // Assign next Action
        this.nextAction(creep);
        // Do some work
        if( creep.action && creep.target ) {
            creep.action.step(creep);
        } else {
            logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
        }
        // heal
        if( creep.data.body.heal !== undefined ) {
            // heal self
            if( creep.hits < creep.hitsMax ){
                creep.heal(creep);
            }
            // heal other
            else if(creep.room.casualties.length > 0 ) {
                let injured = creep.pos.findInRange(creep.room.casualties, 3);
                if( injured.length > 0 ){
                    if(creep.pos.isNearTo(injured[0])) {
                        creep.heal(injured[0]);
                    }
                    else {
                        creep.rangedHeal(injured[0]);
                    }
                }
            }
        }
    },
    nextAction: function(creep, oldTargetId){
        let target = null;
        let hopperTarget = FlagDir.find(FLAG_COLOR.hopper, creep.pos, false); // nearest hopper flag
        // no hopper flag found
        if( !hopperTarget ) {
            // TODO: disassemble creep at home to get energy back
            logError("No target found for hopper creep!");
            target = Game.rooms[creep.data.homeRoom].controller;
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
    }
};