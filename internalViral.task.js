let mod = {};
module.exports = mod;
mod.register = function () {
    let tasks = [

    ];
    var loop = task => {
        task.register();
    }
    _.forEach(tasks, loop);
};


