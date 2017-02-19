let mod = {};
module.exports = mod;
mod.name = 'trainHealer';
mod.run = function(creep) {
    // Assign next Action
    this.nextAction(creep);
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
            let injured = creep.pos.findInRange(creep.room.casualties, 3);
            if( injured.length > 0 ){
                if(creep.pos.isNearTo(injured[0])) {
                    creep.heal(injured[0]);
                } else {
                    creep.rangedHeal(injured[0]);
                }
            }
        }
    }
};
mod.nextAction = function(creep){
    let flag = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);

    Population.registerCreepFlag(creep, flag);

    let target = Game.creeps[Creep.prototype.findGroupMemberByType("trainDestroyer", creep.data.flagName)];

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