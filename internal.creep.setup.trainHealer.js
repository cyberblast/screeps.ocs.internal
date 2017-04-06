var setup = new Creep.Setup('trainHealer');
module.exports = setup;
setup.minControllerLevel = 7;
setup.globalMeasurement = true;
setup.measureByHome = false;

setup.maxCount = Creep.Setup.maxPerFlag(FLAG_COLOR.attackTrain, 3, setup.measureByHome);

setup.default = {
    fixedBody: [],
    multiBody: [MOVE, HEAL],
    minAbsEnergyAvailable: 3600,
    minEnergyAvailable: 0.5,
    minMulti: 12,
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
