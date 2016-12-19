var mod = {
    guard: load("task.guard"),
    handleNewCreep: function(creep) {
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task )
            return;
        let task = Task[creep.data.destiny.task];
        if( !task ) return; 
        task.handleNewCreep(creep);
    },
    register: function () {
        let tasks = [
            Task.guard
        ];
        var loop = task => {
            task.register();
        }
        _.forEach(tasks, loop);
    }
};
module.exports = mod;