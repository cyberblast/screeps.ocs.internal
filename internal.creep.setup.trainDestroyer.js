var setup = new Creep.Setup('trainDestroyer');
setup.minControllerLevel = 4;
setup.globalMeasurement = true;
setup.measureByHome = true;

setup.default = {
    fixedBody: [],
    multiBody: [MOVE, WORK],
    minAbsEnergyAvailable: 1500,
    minEnergyAvailable: 0.5,
    minMulti: 10,
    maxMulti: 25,
    maxCount: 1,
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