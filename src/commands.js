// useful commands

// flush road construction traces
_.forEach(Memory.rooms, r => delete r.roadConstructionTrace);

// remove all construction Sites
_.forEach(Game.constructionSites, s => s.remove());

// spawn something...
Game.spawns['<spawnName>'].createCreepBySetup(Creep.setup.worker)
// or
Game.rooms['<roomName>'].spawnQueueLow.push({parts:[MOVE,WORK,CARRY],name:'max',setup:'worker'})

// move Creep
Game.creeps['<creepName>'].move(RIGHT)
