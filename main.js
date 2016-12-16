/* https://github.com/cyberblast/screeps.ocs.internal */

module.exports.loop = function () {
    global.getPath = (modName, reevaluate = false) => {
        if (Memory.modules === undefined) 
            Memory.modules = {};
        if( reevaluate || !Memory.modules[modName] ){
            let path = './custom.' + modName;
            try {
                var a = require(path);
            }
            catch (e) {
                path = './' + modName
            }
            finally {
                Memory.modules[modName] = path;
            }
        }
        return Memory.modules[modName];
    };
    global.load = (modName) => {
        let mod = null;
        let path = getPath(modName);
        try{        
            mod = require(path);
        }catch(e){
            let reevaluate = getPath(modName, true);
            if( path != reevaluate ){
                try {
                    mod = require(reevaluate);
                } catch(e2){}
            }
        }
        if( !mod ) console.log(`Module "$(modName)" not found!`);
        return mod;
    };

    var params = load("parameter");
    var glob = load("global");
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
        load("statistics").loop();
    processReports();
};