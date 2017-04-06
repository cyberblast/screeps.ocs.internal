let mod = {};
module.exports = mod;
mod.creep = {
    guard: {
        fixedBody: [ATTACK, MOVE],
        multiBody: [TOUGH, ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE],
        name: "guard", 
        behaviour: "warrior", 
        queue: 'Low'
    },
};
