const mod = Object.create(Creep.behaviour.remoteMiner);
module.exports = mod;
mod.name = 'remoteMineralMiner';
mod.mine = function(creep) {
    return Creep.behaviour.miner.run(creep, {remote: true, approach: mod.approach, determineTarget: Creep.behaviour.mineralMiner.determineTarget});
};