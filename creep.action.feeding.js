var action = new Creep.Action('feeding');
action.maxPerTarget = 1;
action.isValidAction = function(creep){
    return ( creep.carry.energy > 0 && creep.room.energyAvailable < creep.room.energyCapacityAvailable );
};
action.isValidTarget = function(target){
    return ( (target != null) && (target.energy != null) && (target.energy < target.energyCapacity) );
};
action.isAddableAction = function(creep){
    return true;
};
action.isAddableTarget = function(target){
    return ( target.my &&
        (!target.targetOf || target.targetOf.length < this.maxPerTarget));
};
action.newTarget = function(creep){
    var that = this;
    return creep.pos.findClosestByPath(creep.room.structures.all, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN )
                && that.isValidTarget(structure) && that.isAddableTarget(structure, creep));
        }
    });
};
action.work = function(creep){
    return creep.transfer(creep.target, RESOURCE_ENERGY);
};
action.onAssignment = function(creep, target) {
    //if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9739), SAY_PUBLIC);
    if( SAY_ASSIGNMENT ) creep.say('\u{1F4E5}\u{FE0E}', SAY_PUBLIC);
};
module.exports = action;