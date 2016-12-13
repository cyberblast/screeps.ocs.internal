var mod = {
    defense: load("task.defense"),
    handleNewCreep: function(creep) {
        if (!creep.data || !creep.data.destiny || !creep.data.destiny.task )
            return;
        let task = Task[creep.data.destiny.task];
        if( !task ) return; 
        // TODO: log something in both above return cases...
        task.handleNewCreep(creep);
    },
    register: function () {
        let tasks = [
            Task.defense
        ];
        var loop = task => {
            task.register();
        }
        _.forEach(tasks, loop);
    }
};
module.exports = mod;