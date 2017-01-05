var setup = new Creep.Setup('trainHealer');
setup.minControllerLevel = 4;
setup.globalMeasurement = true;
setup.measureByHome = true;

setup.maxCount = function(room) {
    let maxRange = 3;
    let max = 0;
    let distance, flag;
    let calcMax = flagEntry => {
        distance = routeRange(room.name, flagEntry.roomName);
        if( distance > maxRange )
            return;
        flag = Game.flags[flagEntry.name];
        if( !flag.targetOf || flag.targetOf.length == 0 )
            max ++;
    }
    let flagEntries = FlagDir.filter(FLAG_COLOR.hopper);
    flagEntries.forEach(calcMax);
    return max;
};

setup.default = {
    fixedBody: [],
    multiBody: [MOVE, HEAL],
    minAbsEnergyAvailable: 1500,
    minEnergyAvailable: 0.5,
    minMulti: 5,
    maxMulti: 25,
    maxCount: setup.maxCount,
    maxWeight: null
};

setup.RCL = {
    1: setup.none,
    2: setup.none,
    3: setup.none,
    4: setup.none,
    5: setup.default,
    6: setup.default,
    7: setup.default,
    8: setup.default
};
module.exports = setup;