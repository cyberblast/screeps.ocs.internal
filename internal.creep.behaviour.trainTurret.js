module.exports = {
    name: 'trainTurret',
    run: function(creep) {
        // Assign next Action
        this.nextAction(creep);
        // Do some work
        if( creep.action && creep.target ) {
            creep.action.step(creep);
        } else {
            logError('Creep without action/activity!\n',{creepName:creep.name,creepData:JSON.stringify(creep.data)});
        }

        let hasRangedAttack = creep.hasActiveRangedAttackPart();

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
    },
    nextAction: function(creep){
        let flag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);

        Population.registerCreepFlag(creep, flag);

        let target = Game.creeps[Creep.prototype.findGroupMemberByType("trainHealer", creep.data.flagName)];

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
    }
};
