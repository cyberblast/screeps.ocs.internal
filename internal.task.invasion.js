const mod = {};
module.exports = mod;

mod.register = () => {
    Flag.found.on(Task.invasion.handleFlagFound);
};

mod.handleFlagFound = flag => {
    flag = Game.flags[flag.name];
    if (flag.is(FLAG_COLOR.invasion)) {
        Task.invasion.checkPhase(flag);
    }
};

mod.checkPhase = flag => {
    flag.memory.phase = flag.memory.phase || 0;
    const flags = flag.room.find(FIND_FLAGS);
    const hoppers = _.filter(flags, f => f.is(FLAG_COLOR.hopper));
    const trains = _.filter(flags, f => f.is(FLAG_COLOR.attackTrain));
    const controllerAttackers = _.filter(flags, f => f.is(FLAG_COLOR.invade.attackController));
    
    if (!flag.memory.flags) flag.memory.flags = [];
    
    const newFlag = (type) => {
        const flagColour = _.get(FLAG_COLOR, type);
        if (!flagColour) return;
        const name = flag.pos.createFlag(null, flagColour.color, flagColour.secondaryColor);
        flag.memory.flags.push({
            name, type
        });
    };
    
    // start phase 1
    if (!(hoppers && hoppers.length && trains && trains.length && controllerAttackers && controllerAttackers.length)) {
        // not yet began
        flag.memory.phase = 1;
        _.times(INVASION.HOPPER_COUNT, n => newFlag('hopper'));
    }
    
    if (!flag.room) {
        // TODO: Request room via. observers
        return false; // we need vision after this point
    }
    
    const room = flag.room;
    
    // check for phase 2
    if (flag.memory.phase === 1) {
        const towers = room.structures.towers;
        if (towers.length) {
            const count = towers.length;
            const energy = _.sum(towers, 'energy');
            if (energy / (count * 1000) <= 0.1) {
                flag.memory.phase = 2;
            }
        } else {
            flag.memory.phase = 2;
        }
        
        if (flag.memory.phase === 2) {
            // TODO: remove hopper flags
        }
    }
    
    // start phase 2 and check for phase 3
    if (flag.memory.phase === 2) {
        const towers = room.structures.towers;
        const spawns = room.structures.spawns;
        const extensions = room.structures.extensions;
        
        if ((spawns && spawns.length) || (towers && towers.length) || (extensions && extensions.length)) {
            _.times(INVASION.TRAIN_COUNT, n => newFlag('attackTrain'));
        } else {
            flag.memory.phase = 3;
        }
        
        if (flag.memory.phase === 3) {
            // TODO: remove train flags
        }
    }
    
    // start phase 3 and check for completion
    if (flag.memory.phase === 3) {
        if (INVASION.ATTACK_CONTROLLER && room.controller && room.controller.owner) {
            _.times(INVASION.ATTACK_CONTROLLER_COUNT, n => newFlag('invade.attackController'));
        } else {
            flag.memory.phase = 4; // finished
            // TODO: remove flags
        }
    }
    
    // mid-phases
    
    // guards
    if (flag.memory.phase === 1 || flag.memory.phase === 3) {
        let removeFlags = true;
        if (room.hostiles && room.hostiles.length) {
            const hostiles = _.filter(room.hostiles, c => c.hasActiveBodyparts([ATTACK, RANGED_ATTACK, HEAL]));
            removeFlags = false;
            if (hostiles && hostiles.length && hostiles.length > 0) {
                const guardCount = typeof INVASION.GUARD_COUNT === 'function' ? INVASION.GUARD_COUNT(flag.memory.phase) : INVASION.GUARD_COUNT;
                _.times(guardCount, n => newFlag('defense'));
            } else {
                removeFlags = true;
            }
        }
        if (removeFlags) {
            // TODO: remove guard flags
        }
    }
    
    // robbers
    if (flag.memory.phase === 2 || flag.memory.phase === 3) {
        let energy = room.energyAvailable;
        if (room.storage) energy += room.storage[RESOURCE_ENERGY];
        if (room.terminal) energy += room.terminal[RESOURCE_ENERGY];
        
        if (energy > 0) {
            _.times(INVASION.ROBBER_COUNT, n => newFlag('invade.robbing'));
        } else {
            // TODO: remove robber flags
        }
    }
    
    return true;
    
};