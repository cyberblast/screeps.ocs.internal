const mod = new Creep.Behaviour('warrior');
module.exports = mod;
const super_invalidAction = mod.invalidAction;
mod.invalidAction = function(creep) {
    return super_invalidAction.call(this, creep) || 
        (creep.action.name === 'guarding' &&
            (!creep.flag || creep.flag.pos.roomName === creep.pos.roomName || creep.leaveBorder())
        );
};
const super_run = mod.run;
mod.run = function(creep) {
    creep.flee = creep.flee || !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK]);
    creep.attacking = false;
    creep.attackingRanged = false;
    super_run.call(this, creep);
    Creep.behaviour.ranger.heal.call(this, creep);
};
mod.actions = function(creep) {
    return [
        Creep.action.invading,
        Creep.action.defending,
        Creep.action.healing,
        Creep.action.guarding,
    ];
};
