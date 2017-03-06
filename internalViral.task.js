let mod = {};
module.exports = mod;
mod.flush = function () {
    const tasks = [
        Task.guard,
        Task.defense,
        Task.claim,
        Task.reserve,
        Task.mining,
        Task.pioneer,
        Task.attackController,
        Task.robbing,
        Task.reputation,
        Task.powerMining,
        Task.train,
    ];
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].flush) {
            tasks[i].flush();
        }
    }
};
// register tasks (hook up into events)
mod.register = function () {
    const tasks = [
        Task.guard,
        Task.defense,
        Task.claim,
        Task.reserve,
        Task.mining,
        Task.pioneer,
        Task.attackController,
        Task.robbing,
        Task.reputation,
        Task.powerMining,
        Task.train,
    ];
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].register) {
            tasks[i].register();
        }
    }
};


