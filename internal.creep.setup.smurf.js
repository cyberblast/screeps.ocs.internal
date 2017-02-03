var setup = new Creep.Setup('smurf');
module.exports = setup;
setup.minControllerLevel = 2;
setup.globalMeasurement = true;
setup.measureByHome = true;

setup.default = {
    fixedBody: [MOVE],
    minAbsEnergyAvailable: 50,
    minEnergyAvailable: 0.5,
    maxCount: 30,
};

setup.RCL = {
    1: setup.default,
    2: setup.default,
    3: setup.default,
    4: setup.default,
    5: setup.default,
    6: setup.default,
    7: setup.default,
    8: setup.default
};
