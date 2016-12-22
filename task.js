var mod = {
    guard: load("task.guard"),
    remoteHauler: load("task.remoteHauler"),
    remoteMiner: load("task.remoteMiner"),
    register: function() {
        let tasks = [
            Task.guard,
            Task.remoteMiner,
            Task.remoteHauler
        ];
        var loop = task => {
            task.register();
        }
        _.forEach(tasks, loop);
    }
};
module.exports = mod;