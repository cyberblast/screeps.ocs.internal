let mod = {};
module.exports = mod;
mod.run = {
    ranger: function(creep) {
        let range = creep.pos.getRangeTo(creep.target);
        if( !creep.flee ){
            if( range > 3 ){
                creep.travelTo( creep.target );
                // FIXME: need to set a custom costMatrix to respect ramparts.
                // let path = creep.room.findPath(creep.pos, creep.target.pos, {ignoreCreeps: false});
                // if( path && path.length > 0 ) {
                //     let isRampart = COMBAT_CREEPS_RESPECT_RAMPARTS && _.some( creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y), {'structureType': STRUCTURE_RAMPART });
                //     if(!isRampart){
                //         creep.move(path[0].direction);
                //     }
                // } else {
                //     // no path -> try to move by direction
                //     let direction = creep.pos.getDirectionTo(creep.target);
                //     if(direction) creep.move(direction);
                // }
            }
            if( range < 3 ) creep.fleeMove();
        }

        // attack ranged
        let targets = creep.pos.findInRange(creep.room.hostiles, 3);
        if(targets.length > 2) { // TODO: precalc damage dealt
            if(CHATTY) creep.say('MassAttack');
            creep.attackingRanged = creep.rangedMassAttack() == OK;
        } else if( range < 4 ) {
            creep.attackingRanged = creep.rangedAttack(creep.target) == OK;
        } else if(targets.length > 0){
            creep.attackingRanged = creep.rangedAttack(targets[0]) == OK;
        }
    },
    sourceKiller: function(creep) {
        if( !creep.flee && creep.pos.getRangeTo(creep.target) > 1 ){
            creep.travelTo(creep.target);
        }
        // attack
        let keeperLair = [];
        let keeperFind = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_KEEPER_LAIR
        });
        for(let index in keeperFind){
            keeperLair.push(keeperFind[index]);
        }
        let lowLair = keeperFind.sort( (a, b) => a.ticksToSpawn - b.ticksToSpawn);
        creep.memory.lairs = lowLair[0];

        let attacking = creep.attack(creep.target);
        if( attacking == ERR_NOT_IN_RANGE ) {
            let targets = creep.pos.findInRange(creep.room.hostiles, 1);
            if( targets.length > 0) creep.attacking = creep.attack(targets[0]) == OK;
        } else creep.attacking = attacking == OK;  
    },
    melee: function(creep) {
        if( !creep.flee && creep.pos.getRangeTo(creep.target) > 1 ){
            creep.travelTo( creep.target );
            // FIXME: need to set a custom costMatrix to respect ramparts.
            // let path = creep.room.findPath(creep.pos, creep.target.pos);
            // // not standing in rampart or next step is rampart as well
            // if( path && path.length > 0 && (
            //     !COMBAT_CREEPS_RESPECT_RAMPARTS ||
            //     !_.some( creep.room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y), {'structureType': STRUCTURE_RAMPART } )  ||
            //     _.some( creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y), {'structureType': STRUCTURE_RAMPART }))
            // ){
            //     creep.move(path[0].direction);
            // }
        }
        // attack
        let attacking = creep.attack(creep.target);
        if( attacking == ERR_NOT_IN_RANGE ) {
            let targets = creep.pos.findInRange(creep.room.hostiles, 1);
            if( targets.length > 0)
                creep.attacking = creep.attack(targets[0]) == OK;
        } else creep.attacking = attacking == OK;
    },
    warrior: function(creep) {
        let range = creep.pos.getRangeTo(creep.target);
        let hasAttack = creep.hasActiveBodyparts(ATTACK);
        let hasRangedAttack = creep.hasActiveBodyparts(RANGED_ATTACK);
        if( !creep.flee ){
            if( hasAttack ){
                if( range > 1 ) creep.travelTo( creep.target );
                // FIXME: need to set a custom costMatrix to respect ramparts.
                // let path = creep.room.findPath(creep.pos, creep.target.pos, {'maxRooms': 1});
                // // not standing in rampart or next step is rampart as well
                // if( path && path.length > 0 && (
                //     !COMBAT_CREEPS_RESPECT_RAMPARTS ||
                //     !_.some( creep.room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y), {'structureType': STRUCTURE_RAMPART } )  ||
                //     _.some( creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y), {'structureType': STRUCTURE_RAMPART }))
                // ){
                //     creep.move(path[0].direction);
                // }
            } else if( hasRangedAttack ) {
                if( range > 3 ) creep.travelTo( creep.target );
                    // FIXME: need to set a custom costMatrix to respect ramparts.
                    // let path = creep.room.findPath(creep.pos, creep.target.pos, {'maxRooms': 1});
                    // if( path && path.length > 0 ) {
                    //     let isRampart = COMBAT_CREEPS_RESPECT_RAMPARTS && _.some( creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y), {'structureType': STRUCTURE_RAMPART });
                    //     if(!isRampart){
                    //         if( path[0] ) creep.move(path[0].direction);
                    //     }
                    // } else {
                    //     // no path -> try to move by direction
                    //     let direction = creep.pos.getDirectionTo(creep.target);
                    //     if( direction ) creep.move(direction);
                    // }
                if( range < 3 ) creep.fleeMove();
            } else creep.flee = true;
        }
        // attack
        if( hasAttack ){
            let attacking = creep.attack(creep.target);
            if( attacking == ERR_NOT_IN_RANGE ) {
                let targets = creep.pos.findInRange(creep.room.hostiles, 1);
                if( targets.length > 0) creep.attacking = creep.attack(targets[0]) == OK;
            } else creep.attacking = attacking == OK;
        }
        // attack ranged
        if( hasRangedAttack ) {
            let targets = creep.pos.findInRange(creep.room.hostiles, 3);
            if(targets.length > 2) { // TODO: precalc damage dealt
                if(CHATTY) creep.say('MassAttack');
                creep.attackingRanged = creep.rangedMassAttack() == OK;
            } else if( range < 4 ) {
                creep.attackingRanged = creep.rangedAttack(creep.target) == OK;
            } else if(targets.length > 0){
                creep.attackingRanged = creep.rangedAttack(targets[0]) == OK;
            }
        }
    }
};
mod.install = function() {
    this.defaultStrategy.targetFilter = function(creep) {
        return function(hostile) {
            if (hostile.owner.username === 'Source Keeper') {
                return creep.pos.getRangeTo(hostile) <= 5;
            }
            return true;
        }
    };
};
