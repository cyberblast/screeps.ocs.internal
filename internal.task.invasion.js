const mod = {};
module.exports = mod;

mod.phases = [
    { // phase one
        condition: mod.checkPhaseOne,
        run: function(flag, params) {
            // not yet begun
            flag.memory.phase = 1;
            _.times(INVASION.HOPPER_COUNT, n => newFlag('hopper'));
        },
    },
    { // phase two
        condition: mod.checkPhaseTwo,
        run: function(flag, params) {
            flag.memory.phase = 2;
            _.times(INVASION.TRAIN_COUNT, n => newFlag(flag, 'attackTrain'));
            // remove hopper flags
            removeFlags(flag, 'hopper');
        },
    },
    { // phase three
        condition: mod.checkPhaseThree,
        run: function(flag, params) {
            flag.memory.phase = 3;
            _.times(INVASION.ATTACK_CONTROLLER_COUNT, n => newFlag('invade.attackController'));
            // remove train flags
            removeFlags('attackTrain');
        },
    },
];

mod.phases_other = {
    final: {
        condition: mod.checkFinished,
        run: function(flag, params) {
            flag.memory.phase = 4;
            _(flag.memory.flags).forEach(f => {
                Game.flags[f.name].remove();
            });
            flag.memory.flags = [];
            flag.remove();
        },
    },
    guards: {
        condition: mod.checkGuards,
        run: function(flag, params) {
            const guardCount = typeof INVASION.GUARD_COUNT === 'function' ? INVASION.GUARD_COUNT(flag.memory.phase) : INVASION.GUARD_COUNT;
            _.times(guardCount, n => newFlag('defense'));
        },
        orElse: function(flag, params) {
            removeFlags('defense');
        },
    },
    robbers: {
        condition: mod.checkRobbers,
        run: function(flag, params) {
            _.times(INVASION.ROBBER_COUNT, n => newFlag('invade.robbing'));
        },
        orElse: function(flag, params) {
            removeFlags('invade.robbing');
        },
    }
};

mod.register = () => {
    if (_.isUndefined(Task.selfRegister)) {
        Flag.found.on(Task.invasion.handleFlagFound);
    }
};

mod.handleFlagFound = flag => {
    flag = Game.flags[flag.name];
    if (flag.compareTo(FLAG_COLOR.invasion)) {
        Task.invasion.checkPhase(flag);
    }
};

mod.checkPhase = flag => {
    flag.memory.phase = flag.memory.phase || 0;
    const flags = flag.room.find(FIND_FLAGS);
    const hoppers = _.filter(flags, f => f.compareTo(FLAG_COLOR.hopper));
    const trains = _.filter(flags, f => f.compareTo(FLAG_COLOR.attackTrain));
    const controllerAttackers = _.filter(flags, f => f.compareTo(FLAG_COLOR.invade.attackController));
    
    const params = {hoppers, trains, controllerAttackers};
    
    if (!flag.memory.flags) flag.memory.flags = [];
    
    if (Task.invasion.phases[0].condition(flag, params)) {
        Task.invasion.phases[0].run(flag, params);
    }
    
    if (!flag.room) {
        // Request room via. observers
        observerRequests = {roomName: flag.pos.roomName};
        return false; // we need vision after this point
    }
    
    const room = flag.room;
    
    _.assign(params, {
        room,
    });
    
    for (let i = 1; i < Task.invasion.phases.length; i++) {
        if (Task.invasion.phases[i].condition(flag, params)) {
            Task.invasion.phases[i].run(flag, params);
        }
    }
    
    for (const phase of Task.invasion.phases_other) {
        if (phase.condition(flag, params)) {
            phase.run(flag, params);
        } else if (phase.orElse) {
            phase.orElse(flag, params)
        }
    }
    
    return true;
    
};

mod.checkPhaseOne = (flag, params) => {
    // No hoppers, trains, or controllerAttackers
    return !(params.hoppers && params.hoppers.length && params.trains && params.trains.length && params.controllerAttackers && params.controllerAttackers.length);
};

mod.checkPhaseTwo = (flag, params) => {
    const towers = params.room.structures.towers;
    const count = towers.length;
    const energy = _.sum(towers, 'energy');
    // must be phase 1, and either no towers or average tower energy must be <= 10%
    return flag.memory.phase === 1 && ((count && energy / (count * 1000) <= 0.1) || !count);
};

mod.checkPhaseThree = (flag, params) => {
    const towers = params.room.structures.towers;
    const spawns = params.room.structures.spawns;
    // must be phase 2, and no spawns or towers
    return flag.memory.phase === 2 && (!spawns || (spawns.length && spawns.length === 0)) || (!towers && (towers.length && towers.length === 0));
};

mod.checkFinished = (flag, params) => {
    // must be phase 3, have ATTACK_CONTROLLER enabled, and the controller (if existing) must not be owned
    return flag.memory.phase === 3 && (!INVASION.ATTACK_CONTROLLER || !params.room.controller || (INVASION.ATTACK_CONTROLLER && params.room.controller && !params.room.controller.owner));
};

mod.checkGuards = (flag, params) => {
    // must be a legitimate phase
    if (!(-1 < flag.memory.phase && flag.memory.phase < Task.invasion.phases.length)) return false;
    // if hostiles in room
    if (params.room.hostiles && params.room.hostiles.length) {
        // and hostiles are of a combat variety
        const hostiles = _.filter(params.room.hostiles, c => c.hasActiveBodyparts([ATTACK, RANGED_ATTACK, HEAL]));
        if (hostiles && hostiles.length && hostiles.length > 0) {
            return true;
        }
    }
    return false;
};

mod.checkRobbers = (flag, params) => {
    let energy = params.room.energyAvailable;
    if (params.room.storage) energy += params.room.storage[RESOURCE_ENERGY];
    if (params.room.terminal) energy += params.room.terminal[RESOURCE_ENERGY];
    // must be phase 2 or 3 and total room energy > 0
    return [2, 3].includes(flag.memory.phase) && energy > 0;
};

const newFlag = (flag, type) => {
    const flagColour = _.get(FLAG_COLOR, type);
    if (!flagColour) return;
    const name = flag.pos.createFlag(null, flagColour.color, flagColour.secondaryColor);
    flag.memory.flags.push({
        name, type
    });
};
const removeFlags = (flag, type) => {
    _(flag.memory.flags).filter({type: type}).forEach(f => {
        Game.flags[f.name].remove();
        let i = flag.memory.flags.indexOf(f);
        flag.memory.flags.splice(i, 1);
    });
};