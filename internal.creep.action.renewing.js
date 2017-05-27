let action = new Creep.Action('renewing');
module.exports = action;
action.isValidAction = function(creep) {
    return !creep.room.situation.invasion;
};
action.isAddableAction = () => true;
action.isAddableTarget = () => true;
action.newTarget = function(creep){
    // find closest spawn, should balance allocations
    return _.chain(creep.room.structures.spawns).sortBy(function(spawn) {
        return creep.pos.getRangeTo(spawn);
    }).first().value();
};
action.work = function (creep) {
    const ticks = creep.ticksToLive;
    const spawn = creep.target;
    let flee = false;

    if (spawn.pos.y-1 === creep.pos.y && creep.pos.x === spawn.pos.y) {
        flee = true;
    }
    if (ticks < 1450) {
        // step toward spawn and request renew
        if (spawn.pos.isNearTo(creep)) {
            if (_.first(spawn.renewable) === creep) {
                spawn.renewCreep(creep);
                flee = true;
            }
        } else {
            creep.move(creep.pos.getDirectionTo(spawn));
        }
    } else {
        flee = true;
    }

    if (flee) {
        // step away from spawn
        if (spawn.pos.isNearTo(creep)) {
            creep.move((creep.pos.getDirectionTo(spawn) + 3 % 8) + 1);
        } else if (Game.time % 5 === ticks % 4) {
                creep.say(ticks, SAY_PUBLIC);
        }
    }
};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(creep.ticksToLive, SAY_PUBLIC);
};
