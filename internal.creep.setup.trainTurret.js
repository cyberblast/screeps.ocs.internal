var setup = new Creep.Setup('trainTurret');
setup.minControllerLevel = 7;
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
    let flagEntries = FlagDir.filter(FLAG_COLOR.attackTrain);
    flagEntries.forEach(calcMax);
    return max;
};

setup.default = {
    fixedBody: [],
    multiBody: [MOVE, RANGED_ATTACK],
    minAbsEnergyAvailable: 3600,
    minEnergyAvailable: 0.5,
    minMulti: 18,
    maxMulti: 25,
    maxCount: setup.maxCount,
    maxWeight: null
};

setup.RCL = {
    1: setup.none,
    2: setup.none,
    3: setup.none,
    4: setup.none,
    5: setup.none,
    6: setup.none,
    7: setup.default,
    8: setup.default
};
module.exports = setup;
