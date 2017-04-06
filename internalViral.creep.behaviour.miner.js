const mod = {};
module.exports = mod;
mod.run = function(creep, params) {
    Creep.behaviour.ranger.heal(creep);

    return this.baseOf.internalViral.run.apply(this, [creep, params]);
};
