var action = new Creep.Action('moveToArea');
action.targetRange = 3;
action.renewTarget = false;
action.isValidAction = creep => (typeof action.target[creep.data.creepType] === 'function');
action.isAddableAction = creep => (action.target[creep.data.creepType](creep) != null);
action.isAddableTarget = function(){ return true; };
action.newTarget = creep => action.target[creep.data.creepType](creep);
action.step = function(creep){
    if(CHATTY) creep.say(this.name, SAY_PUBLIC);
    let range = creep.pos.getRangeTo(creep.target);
    if( range <= this.targetRange ) {
        delete creep.data.actionName;
        delete creep.data.targetId;
        creep.action = null;
        creep.target = null;
        return;
    
    }
    if( creep.target )
        creep.drive( creep.target.pos, this.reachedRange, this.targetRange, range );
};
action.target = {
    remoteHauler: (creep) => {
        let containers = creep.room.structures.container.in;
        let target = null;
        if( creep.room.structures.container.in.length > 0 ) {
            let filling = 0;
            let fullest = cont => {
                let contFilling = cont.sum;
                if( cont.targetOf )
                    contFilling -= _.sum( cont.targetOf.map( t => ( t.actionName == 'uncharging' ? t.carryCapacityLeft : 0 )));
                if( contFilling > filling ){
                    filling = contFilling ;
                    target = cont;
                }
            };
            _.forEach(containers, fullest);

            // if the creep is already near the target don't return target.
            let range = creep.pos.getRangeTo(target);
            if( range <= 3) {
                return null;
            }
        }
        return target;
    }
},
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9933), SAY_PUBLIC);
};
module.exports = action;