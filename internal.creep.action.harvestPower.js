const action = class extends Creep.Action {
    
    constructor(...args) {
        super(...args);
        
        this.renewTarget = false;
    }
    
    isValidAction(creep) {
        const powerBank = creep.room.powerBank && !creep.room.powerBank.cloak;
        if (!powerBank) {
            const flag =  this.targetFlag(creep);
            if (flag) {
                flag.cloaking = Infinity;
                flag.remove();
            }
            return false;
        }
        if (creep.data.diplomacyGame && _.some(creep.room.creeps, c => c.owner.username !== creep.data.diplomacyGame && Creep.action.diplomacy.isValidTarget(c))) return false;
        return creep.hasBodyparts(ATTACK);
    }
    
    isValidTarget(target) {
        return super.isValidTarget(target) && target.power && target.power > 0 && !target.cloak;
    }
    
    newTarget(creep) {
        const flag = this.targetFlag(creep);
        if (!flag) return;
        return _.find(flag.pos.lookFor(LOOK_STRUCTURES), s => s instanceof StructurePowerBank);
    }
    
    targetFlag(creep) {
        return (creep.data.destiny && Game.flags[creep.data.destiny.targetName]) || FlagDir.find(FLAG_COLOR.powerMining, creep.pos);
    }
    
    work(creep) {
        Population.registerCreepFlag(creep, this.targetFlag(creep));
        if (creep.hits > 100) {
            creep.attack(creep.target);
        }
    }
    
};
module.exports = new action('harvestPower');