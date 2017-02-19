let mod = {};
module.exports = mod;
mod.heal = function(creep) {
    if( !creep.attacking && creep.data.body.heal !== undefined ){
        // Heal self
        if( creep.hits < creep.hitsMax ){
            creep.heal(creep);
        }
        // Heal other
        else if(  creep.room.casualties.length > 0 ) {
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