var setup = new Creep.Setup('sourceKiller');
module.exports = setup;
setup.minControllerLevel = 7;
setup.globalMeasurement = true;
setup.measureByHome = true;
setup.sortedParts = false;
setup.maxCount = Creep.Setup.maxPerFlag(FLAG_COLOR.sourceKiller, 2, setup.measureByHome);

setup.big = {
    fixedBody: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
    sort: false,
    minAbsEnergyAvailable: 4100,
    minEnergyAvailable: 0.5,
    maxCount: setup.maxCount,
    maxWeight: null//(room) => room.defenseMaxWeight(2500, 'warrior')
};
setup.RCL = {
    1: setup.none,
    2: setup.none,
    3: setup.none,
    4: setup.none,
    5: setup.none,
    6: setup.none,
    7: setup.big,
    8: setup.big
};
