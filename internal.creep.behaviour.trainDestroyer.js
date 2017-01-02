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
    nextAction: function(creep){
        let target = FlagDir.find(FLAG_COLOR.attackTrain, creep.pos, false);
        let dismantleFlag = FlagDir.find(FLAG_COLOR.destroy.dismantle, creep.pos, false);

        if(!target) {
            logError("No target found for attackTrain!");
            target = Game.rooms[creep.data.homeRoom].controller;
        } else if(creep.pos.roomName != target.pos.roomName) {
            Population.registerCreepFlag(creep, target);
        } else if(dismantleFlag) {
            let dismantleStructure = dismantleFlag.room.lookForAt(LOOK_STRUCTURES, dismantleFlag.pos.x, dismantleFlag.pos.y);
            target = Game.getObjectById(dismantleStructure[0].id);

            if(target) {
                if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                dismantleFlag.remove();
            }
        } else {
            Creep.action.idle.assign(creep);
        }
    }
};
