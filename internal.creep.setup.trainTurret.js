var setup = new Creep.Setup('trainTurret');
module.exports = setup;
setup.minControllerLevel = 7;
setup.globalMeasurement = true;
setup.measureByHome = false;

setup.maxCount = Creep.Setup.maxPerFlag(FLAG_COLOR.attackTrain, 10, setup.measureByHome);

setup.low = {
    fixedBody: [TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE, TOUGH, MOVE],
    multiBody: [MOVE, RANGED_ATTACK],
    minAbsEnergyAvailable: 2300,
    minEnergyAvailable: 0.5,
    minMulti: 8,
    maxMulti: 20,
    maxCount: setup.maxCount,
    maxWeight: null
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
    6: setup.low,
    7: setup.default,
    8: setup.default
};
