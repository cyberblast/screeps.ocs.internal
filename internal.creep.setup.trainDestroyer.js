var setup = new Creep.Setup('trainDestroyer');
module.exports = setup;
setup.minControllerLevel = 7;
setup.globalMeasurement = true;
setup.measureByHome = true;

setup.maxCount = Creep.Setup.maxPerFlag(FLAG_COLOR.attackTrain, 3, setup.measureByHome);

setup.default = {
    fixedBody: [],
    multiBody: [MOVE, WORK],
    minAbsEnergyAvailable: 3750,
    minEnergyAvailable: 0.5,
    minMulti: 25,
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
