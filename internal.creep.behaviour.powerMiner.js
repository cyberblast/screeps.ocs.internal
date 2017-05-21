const mod = {};
module.exports = mod;
mod.name = 'powerMiner';
mod.run = function(creep) {
    // Assign next Action
    if (!creep.action || creep.action.name === 'idle') this.nextAction(creep);
    // Do some work
    if (creep.action) {
        const roomName = creep.pos.roomName;
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
};
mod.nextAction = function(creep) {
    if (creep.room.name !== creep.data.destiny.room) return Creep.action.travelling.assignRoom(creep, creep.data.destiny.room);
    const priority = [
        Creep.action.diplomacy,
        Creep.action.harvestPower,
        Creep.action.recycling,
        Creep.action.idle,
    ];
    for (const action of priority) {
        if (action.isValidAction(creep) && action.isAddableAction(creep) && action.assign(creep)) {
            if (action.name !== 'idle') {
                creep.data.lastAction = action.name;
                creep.data.lastTarget = creep.target.id;
            }
            return true;
        }
    }
    return false;
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};
