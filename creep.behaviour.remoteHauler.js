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
        if( creep.sum < creep.carryCapacity/2 ) {
            if( flag && flag.pos.roomName != creep.pos.roomName ){
                if( creep.data.getTick ) {
                    flag.memory.tasks['remoteHauler'].walkTime = Game.time - creep.data.getTick;
                    console.log(creep.name + ": walktime - " + flag.memory.tasks['remoteHauler'].walkTime);
                }
                Creep.action.travelling.assign(creep, flag);
                Population.registerCreepFlag(creep, flag);
                return true;
            }
            priority = [
                Creep.action.uncharging,
                Creep.action.picking,
                Creep.action.reallocating,
                Creep.action.withdrawing,
                Creep.action.idle];
        }
        else {
            if( creep.pos.roomName != creep.data.homeRoom ){
                creep.data.getTick = Game.time;
                Population.registerCreepFlag(creep, null);
                Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
                return true;
            }
            priority = [
                Creep.action.storing,
                Creep.action.idle];

            if ( creep.sum > creep.carry.energy ||
                ( !creep.room.situation.invasion
                && SPAWN_DEFENSE_ON_ATTACK
                && creep.room.conserveForDefense && creep.room.relativeEnergyAvailable > 0.8)) {
                    priority.unshift(Creep.action.storing);
            }
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
