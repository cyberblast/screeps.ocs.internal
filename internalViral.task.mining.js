let mod = {};
module.exports = mod;
mod.setupCreep = function(roomName, definition) {
    definition = this.baseOf.internalViral.setupCreep.apply(this, [roomName, definition]);

    switch (definition.behaviour) {
        default:
            return definition;

        case 'remoteMiner':
            let memory = this.memory(roomName);
            if (!memory.healSize) {
                return definition;
            }

            const healParts = Math.max(0, memory.healSize);
            const extraMoveParts = Math.ceil(healParts * 0.5 + definition.moveBalance);

            return _.create(definition, {
                fixedBody: definition.fixedBody
                    .concat(_.times(extraMoveParts, _.constant(MOVE)))
                    .concat(_.times(healParts, _.constant(HEAL))),
                moveBalance: (healParts % 2) * -0.5 + definition.moveBalance,
            })
    }
};
mod.heal = function(roomName, partChange) {
    let memory = Task.mining.memory(roomName);
    memory.healSize = (memory.healSize || 0) + (partChange || 0);
    return `Task.${this.name}: healing capacity for ${roomName} ${memory.healSize >= 0 ? 'increased' : 'decreased'} to ${Math.abs(memory.healSize)} per miner.`;
};
