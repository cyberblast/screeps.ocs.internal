let mod = {};
module.exports = mod;
mod.name = 'follower';
mod.run = function(creep) {
    if (!creep.action || creep.action.name === 'idle') {
        // Assign next Action
        this.nextAction(creep);
    }
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }

    if(creep.data.body.heal !== undefined){
        // Heal self
        if( creep.hits < creep.hitsMax ){
            creep.heal(creep);
        }
        // Heal other
        else if(creep.room.casualties.length > 0 ) {
            const injured = creep.pos.findInRange(creep.room.casualties, 3);
            if( injured.length > 0 ){
                const closest = creep.pos.findClosestByRange(injured);
                if(creep.pos.isNearTo(closest)) {
                    creep.heal(closest);
                } else {
                    creep.rangedHeal(injured[0]);
                }
            }
        }
    }

    let hasRangedAttack = creep.hasActiveBodyparts(RANGED_ATTACK);
    if( hasRangedAttack ) {
        let targets = creep.pos.findInRange(creep.room.hostiles, 3);
        if(targets.length > 2) { // TODO: precalc damage dealt
            if(CHATTY) creep.say('MassAttack');
            creep.attackingRanged = creep.rangedMassAttack() == OK;
            return;
        }

        let range = creep.pos.getRangeTo(creep.target);
        if( range < 4 ) {
            creep.attackingRanged = creep.rangedAttack(creep.target) == OK;
            return;
        }
        if(targets.length > 0){
            creep.attackingRanged = creep.rangedAttack(targets[0]) == OK;
        }
    }

};
mod.nextAction = function(creep){
    let flag = FlagDir.find(FLAG_COLOR.trainFollow, creep.pos, false);

    Population.registerCreepFlag(creep, flag);
    
    let target = Game.creeps[Creep.prototype.findGroupMemberByType("leader", creep.data.flagName)];
    if(!target) target = flag;

   if(!flag) {
        Creep.action.recycling.assign(creep);
    } else if(!target) {
        if(creep.pos.roomName != creep.data.homeRoom) {
            Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
        } else {
            Creep.action.idle.assign(creep);
        }
    } else {
        Creep.action.travelling.assign(creep, target);
    }
};
