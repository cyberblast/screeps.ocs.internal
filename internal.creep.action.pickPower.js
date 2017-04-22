const action = class extends Creep.Action {
    
    constructor(...args) {
        super(...args);
        
        this.maxPerAction = 100;
        this.maxPerTarget = 5;
    }
    
    isValidAction(creep) {
        return creep.sum < creep.carryCapacity;
    }
    
    isValidTarget(creep) {
        return super.isValidTarget(creep) && !!target.amount;
    }
    
    isAddableAction(creep) {
        if (creep.data.creepType.includes('remote')) return true;
        return super.isAddableAction(creep);
    }
    
    isAddableTarget(target, creep) {
        const max = creep.data.creepType.includes('remote') ? Infinity : this.maxPerTarget;
        const pickers = target.targetOf ? _.filter(target.targetOf, {actionName: this.name}) : [];
        return !target.targetOf || !pickers.length || (pickers.length < max && target.amount > _.sum(pickers.map(t => t.carryCapacityLeft)));
    }
    
    newTarget(creep) {
        let target;
        if (creep.room.situation.invasion) {
            // pickup near sources only
            target = creep.pos.findClosestByPath(creep.room.droppedResources, {
                filter: o => this.isAddableTarget(o, creep) && o.pos.findInRange(creep.room.sources, 1).length > 0
            });
        } else {
            target = creep.pos.findClosestByPath(creep.room.droppedResources, {
                filter: o => {
                    if (!this.isAddableTarget(o, creep)) return false;
                    if (creep.room.storage && creep.room.storage.my) {
                        return o.resourceType !== RESOURCE_POWER;
                    }
                    return o.resourceType === RESOURCE_POWER;
                }
            });
        }
        return target;
    }
    
    work(creep) {
        let result = creep.pickup(creep.target);
        if (result === OK) {
            if (creep.sum < creep.carryCapacity * 0.8) {
                // is there another in range?
                let loot = creep.pos.findInRange(creep.pos.droppedResources, 1, {
                    filter: o => o.resourceType !== RESOURCE_POWER && this.isAddableTarget(o, creep)
                });
                if (!loot || loot.length < 1) loot = creep.pos.findInRange(creep.room.droppedResources, 1, {
                    filter: o => this.isAddableTarget(o, creep)
                });
                if (loot && loot.length) {
                    this.assign(creep, loot[0]);
                    return result;
                }
            }
            // unregister
            delete creep.data.actionName;
            delete creep.data.targetId;
        }
        return result;
    }
    
};
module.exports = new action('pickPower');