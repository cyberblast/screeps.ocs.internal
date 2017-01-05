module.exports = {
    name: 'trainDestroyer',
    run: function(creep) {
        // Assign next Action
        this.nextAction(creep);
        // Do some work
        if( creep.action && creep.target ) {
            creep.action.step(creep);
        } else {
            logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
        }
    },
    nextAction: function(creep) {
        let target = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
        let dismantleFlag = FlagDir.find(FLAG_COLOR.destroy.dismantle, creep.pos, false);

        Population.registerCreepFlag(creep, target);

        let trainHealer = Game.creeps[Creep.prototype.findGroupMemberByType("trainHealer", creep.data.flagName)];
        let trainTurret =Game.creeps[Creep.prototype.findGroupMemberByType("trainTurret", creep.data.flagName)];

        if(!target || !trainHealer || !trainTurret) {
            Creep.action.idle.assign(creep);
        } else if(creep.pos.roomName != target.pos.roomName) {
            Creep.action.travelling.assign(creep, target);
        } else if(dismantleFlag) {
            Creep.action.dismantling.assign(creep);
        } else {
            Creep.action.recycling.assign(creep);
        }
    }
};
