var action = new Creep.Action('hopping');
action.newTarget = function(creep){
    return creep.target = FlagDir.find(FLAG_COLOR.invade.hopperHome);
};

action.work = function(creep){
    //var injured = creep.pos.findInRange(creep.room.casualties, 3);
    //if(creep.hits != creep.hitsMax || creep.hits < creep.hitsMax || (!injured.length > 0)){
    if(creep.hits != creep.hitsMax || creep.hits < creep.hitsMax){
    //if(!hop){
        if(creep.pos.x == 0 || creep.pos.y == 0 || creep.pos.x == 49 || creep.pos.y == 49) {
                action.newTarget = function(creep){
                return creep.target = FlagDir.find(FLAG_COLOR.invade.hopperHome);
            };
        }
        
        let injured = creep.pos.findInRange(creep.room.casualties, 3);
        if( injured.length > 0 ){
            if(creep.pos.isNearTo(injured[0])) {
                creep.heal(injured[0]);
            }
            else {
                creep.rangedHeal(injured[0]);
            }
        }
        return OK;
    }
    else if (creep.hits === creep.hitsMax){
    //if (hop){
        action.newTarget = function(creep){
            return creep.target = FlagDir.find(FLAG_COLOR.invade.hopper);
        };
        return OK;
    }
};

action.step = function(creep){
    if(CHATTY) creep.say(this.name, SAY_PUBLIC);
    let range = creep.pos.getRangeTo(creep.target);
    if( range <= this.targetRange ) {
        var workResult = this.work(creep);
        if( workResult != OK ) {
            if( DEBUG ) logErrorCode(creep, workResult);
            delete creep.data.actionName;
            delete creep.data.targetId;
            creep.action = null;
            creep.target = null;
            return;
        }
    }

    if( creep.target )
        creep.drive( creep.target.pos, this.reachedRange, this.targetRange, range );
};

module.exports = action;
