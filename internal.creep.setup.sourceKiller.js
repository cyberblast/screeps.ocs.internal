var setup = new Creep.Setup('sourceKiller');
setup.minControllerLevel = 7;
setup.globalMeasurement = true;
setup.measureByHome = true;
setup.sortedParts = false;
setup.maxCount = function(room){
    let maxRange = 2;
    let max = 0;
    let distance, flag;
    let calcMax = flagEntry => {
        distance = routeRange(room.name, flagEntry.roomName);
        if( distance > maxRange )
            return;
        flag = Game.flags[flagEntry.name];
        if( !flag.targetOf || flag.targetOf.length == 0 )
            max++;
    }
    let flagEntries = FlagDir.filter(FLAG_COLOR.sourceKiller);
    flagEntries.forEach(calcMax);
    return max;
};

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
module.exports = setup;
