module.exports = {
    name: 'remoteHauler',
    run: function(creep) {
        // Assign next Action
        let oldTargetId = creep.data.targetId;
        if( creep.action == null || creep.action.name == 'idle' ) {
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
    },
    nextAction: function(creep){
        let priority;
        let flag = Game.flags[creep.data.destiny.flagName];

        if( creep.sum < creep.carryCapacity * 0.75 ) {
            // Not in the target room, then travel.
            if( flag && flag.pos.roomName != creep.pos.roomName ){
                if( creep.data.getTick ) {
                    Task.remoteHauler.memory(flag).walkTime = Game.time - creep.data.getTick;
                }
                Creep.action.travelling.assign(creep, flag);
                Population.registerCreepFlag(creep, flag);
                return true;
            }

            priority = [
                Creep.action.picking,
                Creep.action.uncharging,
                Creep.action.moveToArea,
                Creep.action.idle];

        } else {
            // Not in home room, then travel.
            if( creep.pos.roomName != creep.data.homeRoom ){
                creep.data.getTick = Game.time;
                Population.registerCreepFlag(creep, null);
                Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
                return true;
            }

            priority = [
                Creep.action.storing,
                Creep.action.idle];

            // If the room has urgentRepairable structures, then fill towers.
            if (creep.room.structures.urgentRepairable.length > 0 ) {
                priority.unshift(Creep.action.fueling);
            }
        }

        for(var iAction = 0; iAction < priority.length; iAction++) {
            var action = priority[iAction];
            if(action.isValidAction(creep) &&
                action.isAddableAction(creep) &&
                action.assign(creep)) {
                    return;
            }
        }
    }
}