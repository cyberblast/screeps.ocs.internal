var action = new Creep.Action('sourceKiller');
module.exports = action;
action.isAddableAction = function(){ return true; };
action.isAddableTarget = function(){ return true; };
action.newTarget = function(creep){
    var flag;
    if( creep.data.destiny ) flag = Game.flags[creep.data.destiny.flagName];
    if ( !flag ) {
        flag = FlagDir.find(FLAG_COLOR.sourceKiller, creep.pos, false, FlagDir.rangeMod, {
            rangeModPerCrowd: 400
        });
    }
        if((creep.room.find(FIND_HOSTILE_CREEPS)).length === 0  && creep.memory.lairs != undefined){
            target = Game.getObjectById(creep.memory.lairs.id);
            //console.log(target);
            return target;
        }else{
        if( creep.action && creep.action.name == 'sourceKiller' && creep.flag )
            return creep.flag;
        if( flag ) Population.registerCreepFlag(creep, flag);
        return flag;}
    
};
action.work = function(creep){
    if( creep.data.flagName )
        return OK;
    else return ERR_INVALID_ARGS;
};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9929), SAY_PUBLIC);
};
