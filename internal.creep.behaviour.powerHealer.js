let mod = {};
module.exports = mod;
mod.name = 'powerHealer';
mod.run = function(creep) {
    // Assign next Action
    if (!creep.action || creep.action.name === 'idle') this.nextAction(creep);
    // Do some work
    if( creep.action ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }

    if(creep.data.body.heal !== undefined){
        // Heal self
        if( creep.hits < creep.hitsMax ){
            creep.heal(creep);
        }
        // Heal other
        else if(creep.room.casualties.length > 0 ) {
            const injured = creep.pos.findInRange(creep.room.casualties, 3);
            if( injured.length > 0 ){
                const closest = creep.pos.findClosestByRange(injured);
                if(creep.pos.isNearTo(closest)) {
                    creep.heal(closest);
                } else {
                    creep.rangedHeal(injured[0]);
                }
            }
        }
    }
};
mod.nextAction = function(creep){
    const flag = mod.getFlag(creep);
    if (!flag) return Creep.action.recycling.assign(creep);

    Population.registerCreepFlag(creep, flag);
    let miner = Game.creeps[Creep.prototype.findGroupMemberByType("powerMiner", flag.name)];
    if(!miner || creep.pos.getRangeTo(flag) > 2) { // get to the flag
        creep.data.travelRange = 2;
        return Creep.action.travelling.assign(creep, flag);
    } else if (miner.pos.roomName === flag.pos.roomName && creep.pos.getRangeTo(miner) > 1) { // near the flag, now find the miner
        creep.data.ignoreCreeps = false;
        return Creep.action.travelling.assign(creep, miner);
    }
    return Creep.action.idle.assign(creep);
};
mod.getFlag = function(creep) {
    let flag = creep.data.destiny && Game.flags[creep.data.destiny.targetName];
    if (flag) return flag;
    else return FlagDir.find(FLAG_COLOR.invade.powerMining, creep.pos, false);
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            // allow routing in and through hostile rooms
            if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
            return options;
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};
