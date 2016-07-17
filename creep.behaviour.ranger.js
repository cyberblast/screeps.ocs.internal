var work = {
    run: function(creep) {
        var assignment;
        if( creep.room.situation.invasion )
            assignment = MODULES.creep.assignActionWithTarget(creep, MODULES.creep.action.defending);
        else 
            assignment = MODULES.creep.assignActionWithTarget(creep, MODULES.creep.action.guarding);
        
        if( !assignment ) MODULES.creep.assignActionWithTarget(creep, MODULES.creep.action.idle);
        
        if( creep.action ) creep.action.step(creep);
    }
}

module.exports = work;