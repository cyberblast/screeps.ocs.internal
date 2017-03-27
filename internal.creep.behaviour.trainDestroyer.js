let mod = {};
module.exports = mod;
mod.name = 'trainDestroyer';
mod.run = function(creep) {
    // Assign next Action
    this.nextAction(creep);
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
};
mod.nextAction = function(creep) {
    let target = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
    let dismantleFlag = FlagDir.find(FLAG_COLOR.destroy.dismantle, creep.pos, false);

    Population.registerCreepFlag(creep, target);

    let trainHealer = Game.creeps[Creep.prototype.findGroupMemberByType("trainHealer", creep.data.flagName)];
    let trainTurret =Game.creeps[Creep.prototype.findGroupMemberByType("trainTurret", creep.data.flagName)];

    if(!target) {
        Creep.action.recycling.assign(creep);
    } else if(!trainHealer || !trainTurret) {
        if(creep.pos.roomName != creep.data.homeRoom) {
            Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
        } else {
            Creep.action.idle.assign(creep);
        }
    } else if(creep.pos.roomName != target.pos.roomName) {
        Creep.action.travelling.assign(creep, target);
    } else if(dismantleFlag && Creep.action.dismantling.assign(creep)) {
        return;
    } else if (target && creep.pos.getRangeTo(target) > 0) {
        Creep.action.travelling.assign(creep, target);
    } else {
        Creep.action.idle.assign(creep);
    }
};
