var mod = {
    defense: require('./task.defense'),
    exploit: require('./task.exploit'),
    loop: function(){
            let tasks = [
                Task.defense,
                Task.exploit
            ];
            var loop = task => {
                task.checkForRequiredCreeps();
            }
            _.forEach(tasks, loop);
        }
};
module.exports = mod;