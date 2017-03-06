let mod = {};
module.exports = mod;
mod.name = 'leader';
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
    let target = FlagDir.find(FLAG_COLOR.trainFollow, creep.pos, false);
    let dismantleFlag = FlagDir.find(FLAG_COLOR.destroy.dismantle, creep.pos, false);

    Population.registerCreepFlag(creep, target);

    const countExisting = type => {
        const invalidEntry = false;
        const running = _.map(memory.running[type], n => {
            const c = Game.creeps[n];
            if (!c) invalidEntry = true;
            return c;
        });
        if (invalidEntry) {
            Task.powerMining.validateRunning(roomName, type);
            running = _.map(memory.running[type], n => Game.creeps[n].length);
        }
        return running;
    };

    let followerCount = countExisting('follower');
    
    if(!target) {
        Creep.action.recycling.assign(creep);
    } else if( followerCount < 2 ) {
        if(creep.pos.roomName != creep.data.homeRoom) {
            Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
        } else {
            Creep.action.idle.assign(creep);
        }
    } else if(creep.pos.roomName != target.pos.roomName) {
        Creep.action.travelling.assign(creep, target);
    } else if(dismantleFlag) {
        Creep.action.dismantling.assign(creep);
    }
};
