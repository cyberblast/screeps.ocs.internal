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
    },
    memory: (task, s) => { // task:  (string) name of the task, s: (string) any selector for that task, could be room name, flag name, enemy name
        if( !Memory.tasks ) Memory.tasks = {};
        if( !Memory.tasks[task] ) Memory.tasks[task] = {};
        if( !Memory.tasks[task][s] ) Memory.tasks[task][s] = {};
        return Memory.tasks[task][s];
    }
};
module.exports = mod;