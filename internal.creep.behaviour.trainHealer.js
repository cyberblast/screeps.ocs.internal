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

    Creep.behaviour.ranger.heal(creep);
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
