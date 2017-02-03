let mod = {};
module.exports = mod;
mod.heal = function(creep){
    if( creep.data.body.heal !== undefined  ) {
        const mustHealSelf = creep.hits < creep.data.hullHits;
        if( mustHealSelf || creep.hits < creep.hitsMax ){
            // Heal self if not attacking or missing combat parts
            if( mustHealSelf || !creep.attacking ) {
                creep.heal(creep);
            }
        }
        // Heal other
        else if( creep.room.casualties.length > 0 ){
            let injured = creep.pos.findInRange(creep.room.casualties, 3);
            if( injured.length > 0 ){
                const target = injured[0];
                const canHeal = creep.pos.isNearTo(target) && !mustHealSelf;
                const shouldHeal = target.data && target.hits < target.data.coreHits;
                // Heal other if not attacking or they are badly hurt
                if( canHeal && (shouldHeal || !creep.attacking) ) {
                    creep.heal(target);
                } else if( !(!mustHealSelf || !shouldHeal || creep.attackingRanged || creep.attacking) ) {
                    creep.rangedHeal(target);
                }
            }
        }
    }
};
