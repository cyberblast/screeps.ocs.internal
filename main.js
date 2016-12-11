/* https://github.com/cyberblast/screeps.ocs.internal */

let modules = [
    "creep",
    "creep.Action",
    "creep.Setup",
    "creep.action.building",
    "creep.action.charging",
    "creep.action.claiming",
    "creep.action.defending",
    "creep.action.dismantling",
    "creep.action.feeding",
    "creep.action.fortifying",
    "creep.action.fueling",
    "creep.action.guarding",
    "creep.action.harvesting",
    "creep.action.healing",
    "creep.action.idle",
    "creep.action.invading",
    "creep.action.picking",
    "creep.action.reallocating",
    "creep.action.repairing",
    "creep.action.reserving",
    "creep.action.robbing",
    "creep.action.storing",
    "creep.action.travelling",
    "creep.action.uncharging",
    "creep.action.upgrading",
    "creep.action.withdrawing",
    "creep.behaviour.claimer",
    "creep.behaviour.hauler",
    "creep.behaviour.melee",
    "creep.behaviour.miner",
    "creep.behaviour.mineralMiner",
    "creep.behaviour.pioneer",
    "creep.behaviour.privateer",
    "creep.behaviour.ranger",
    "creep.behaviour.upgrader",
    "creep.behaviour.warrior",
    "creep.behaviour.worker",
    "creep.setup.claimer",
    "creep.setup.hauler",
    "creep.setup.healer",
    "creep.setup.melee",
    "creep.setup.miner",
    "creep.setup.mineralMiner",
    "creep.setup.pioneer",
    "creep.setup.privateer",
    "creep.setup.ranger",
    "creep.setup.upgrader",
    "creep.setup.warrior",
    "creep.setup.worker",
    "extensions",
    "flagDir",
    "global",
    "parameter",
    "population",
    "room",
    "spawn",
    "statistics",
    "task",
    "task.defense",
    "tower"
];

module.exports.loop = function () {
    if (Memory.modules === undefined || Memory.modules.reload) {
        Memory.modules = {};
        let checkModule = mod => {
            let path = './custom.' + mod;
            try {
                var a = require(path);
            }
            catch (e) {
                path = './' + mod
            }
            finally {
                let nameParts = mod.split('.');
                let mem = Memory.modules;
                let ensureNamespace = name => {                    
                    if( mem[name] === undefined ) 
                        mem[name] = {};
                    mem = mem[name];
                }
                nameParts.forEach(ensureNamespace);
                mem['path'] = path;
            }
        };
        modules.forEach(checkModule);
    }

    var params = require(Memory.modules.parameter.path);
    var glob = require(Memory.modules.global.path);
    glob.init(params);
    Extensions.extend();
    Creep.extend();
    Room.extend();
    Spawn.extend();
    FlagDir.extend();

    Task.register();
    FlagDir.loop();
    Population.loop();

    var roomLoop = room => {
        room.loop();
        Tower.loop(room);
    };
    _.forEach(Game.rooms, roomLoop);

    Creep.loop();
    /*
    if ( Game.time % SPAWN_INTERVAL == 0 ) {
        Task.loop();
    }*/
    Spawn.loop();

    if( Memory.statistics && Memory.statistics.tick && Memory.statistics.tick + TIME_REPORT <= Game.time )
        require(Memory.modules.statistics.path).loop();
    processReports();
};