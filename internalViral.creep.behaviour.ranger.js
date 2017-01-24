let mod = {};
module.exports = mod;
mod.heal = function(creep){
    if( creep.data.body.heal !== undefined  ) {
        // Heal self
        if( creep.hits < creep.hitsMax ){
            creep.heal(creep);
        }
        // Heal other
        else if( !creep.attackingRanged && creep.room.casualties.length > 0 ){
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
