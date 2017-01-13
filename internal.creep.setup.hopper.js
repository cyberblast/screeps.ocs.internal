var setup = new Creep.Setup('hopper');
setup.minControllerLevel = 4;
setup.globalMeasurement = true;
setup.measureByHome = true;

setup.maxCount = Creep.Setup.maxPerFlag(FLAG_COLOR.hopper, 3, false);

setup.default = {
    fixedBody: [], 
    multiBody: [TOUGH, MOVE, MOVE, HEAL], 
    minAbsEnergyAvailable: 1080, 
    minEnergyAvailable: 0.4,
    maxMulti: 12, 
    minMulti: 3, 
    maxCount: setup.maxCount,
    maxWeight: null
};

setup.RCL = {
    1: setup.none,
    2: setup.none,
    3: setup.none,
    4: setup.default,
    5: setup.default,
    6: setup.default,
    7: setup.default,
    8: setup.default
};

module.exports = setup;
