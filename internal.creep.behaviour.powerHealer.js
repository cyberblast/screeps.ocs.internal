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

    Creep.behaviour.ranger.heal(creep);
};
mod.nextAction = function(creep){
    const flag = mod.getFlag(creep);
    let miner = Game.getObjectById(creep.data.miner);
    if (!flag) {
        // flag is gone, do we still need to heal our miner?
        if (!miner || miner.hits === miner.hitsMax) {
            return Creep.action.recycling.assign(creep);
        } else if (!creep.pos.isNearTo(miner)) {
            creep.data.ignoreCreeps = false;
            return Creep.action.travelling.assign(creep, miner);
        } else {
            return Creep.action.idle.assign(creep);
        }
    }

    Population.registerCreepFlag(creep, flag);
    if (!miner) {
        miner = Game.creeps[Creep.prototype.findGroupMemberByType("powerMiner", flag.name)];
        if (miner && miner.targetOf && miner.targetOf.length >= 2) { // try to find another miner with less than two healers
            const otherMiners = creep.room.creeps.filter(c => c.data && c.data.creepType === 'powerMiner' && c.targetOf.length < 2);
            if (otherMiners.length) {
                miner = otherMiners[0];
            }
        }
        creep.data.miner = miner && miner.id;
    }

    if (miner) Util.get(miner, 'targetOf', []).push(creep); // initialize if undefined, and register it as our target

    // if the miner is next to the flag (working presumably) but we are not next to the miner
    if (miner && miner.pos.isNearTo(flag) && !creep.pos.isNearTo(miner)) {
        creep.data.ignoreCreeps = false;
        return Creep.action.travelling.assign(creep, miner);
    } else if (creep.pos.getRangeTo(flag) > 2) {
        creep.data.travelRange = 2;
        return Creep.action.travelling.assign(creep, flag);        
    }
    return Creep.action.idle.assign(creep);
};
mod.getFlag = function(creep) {
    let flag = creep.data.destiny && Game.flags[creep.data.destiny.targetName];
    if (flag) return flag;
    else return FlagDir.find(FLAG_COLOR.powerMining, creep.pos, false);
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            return options;
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};
