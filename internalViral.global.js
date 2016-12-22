var mod = {
    extend: function(){
        Creep.setup.warrior = load("creep.setup.warrior");
        Creep.behaviour.warrior = load("creep.behaviour.warrior");
        Creep.setup.hopper = load("creep.setup.hopper");
        Creep.behaviour.hopper = load("creep.behaviour.hopper");
    }
}
module.exports = mod;
