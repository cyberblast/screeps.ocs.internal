var mod = {
    extend: function(){
        Spawn.priorityHigh = [
            Creep.setup.miner,
            Creep.setup.mineralMiner,
            Creep.setup.worker,
            Creep.setup.hauler,
            Creep.setup.upgrader];
        Spawn.priorityLow = [
//            Creep.setup.warrior,
//            Creep.setup.melee,
//            Creep.setup.ranger,
            Creep.setup.healer,
            Creep.setup.pioneer,
            Creep.setup.privateer,
            Creep.setup.claimer,
            Creep.setup.hopper];
        Spawn.prototype.loop = function(){
            if( this.spawning ) return;
            let room = this.room;
            // old spawning system 
            let that = this;
            let probe = setup => {
                return setup.isValidSetup(room) && that.createCreepBySetup(setup);
            }

            let busy = this.createCreepByQueue(room.spawnQueueHigh);
            // don't spawn lower if there is one waiting in the higher queue 
            if( !busy && room.spawnQueueHigh.length == 0 && Game.time % SPAWN_INTERVAL == 0 ) {
                busy = _.some(Spawn.priorityHigh, probe);
                if( !busy ) busy = this.createCreepByQueue(room.spawnQueueMedium);
                if( !busy && room.spawnQueueMedium.length == 0 ) {
                    busy = _.some(Spawn.priorityLow, probe);
                    if( !busy ) busy = this.createCreepByQueue(room.spawnQueueLow);
                }
            }
            return busy;
        };
        Spawn.prototype.createCreepBySetup = function(setup){
            var params = setup.buildParams(this);
            if( this.create(params.parts, params.name, params.setup) )
                return params;
            return null;
        };
        Spawn.prototype.createCreepByQueue = function(queue){
            if( !queue || queue.length == 0 ) return null;
            let params = queue.shift();
            let cost = 0;
            params.parts.forEach(function(part){
                cost += BODYPART_COST[part];
            });
            // wait with spawn until enough resources are available
            if (cost > this.room.remainingEnergyAvailable) {
                if (cost > this.room.energyCapacityAvailable) {
                    console.log( dye(CRAYON.system, this.pos.roomName + ' &gt; ') + dye(CRAYON.error, 'Queued creep too big for room: ' + JSON.stringify(params) ) );
                    return false;
                }
                queue.unshift(params);
                return true;
            }
            var completeName;
            var stumb = params.name;
            for (var son = 1; completeName == null || Game.creeps[completeName]; son++) {
             completeName = params.name + '-' + son;
            }
            params.name = completeName;
            let result = this.create(params.parts, params.name, params.setup, params.destiny);
            if( !result ){
                params.name = stumb;
                queue.unshift(params);
            }
            return result;
        };
        Spawn.prototype.create = function(body, name, type, destiny){
            if( body.length == 0 ) return false;
            var newName = this.createCreep(body, name, null);
            if( name == newName || translateErrorCode(newName) === undefined ){
                let cost = 0;
                body.forEach(function(part){
                    cost += BODYPART_COST[part];
                });
                this.room.reservedSpawnEnergy += cost;
                Population.registerCreep(
                    newName,
                    type,
                    cost,
                    this.room,
                    this.name,
                    body,
                    destiny); 
                this.newSpawn = {name: newName};
                Creep.spawningStarted.trigger({spawn: this.name, name: newName, destiny: destiny});
                if(CENSUS_ANNOUNCEMENTS) console.log( dye(CRAYON.system, this.pos.roomName  + ' &gt; ') + dye(CRAYON.birth, 'Good morning ' + newName + '!') );
                return true;
            }
            if( DEBUG ) console.log( dye(CRAYON.system, this.pos.roomName + ' &gt; ') + dye(CRAYON.error, 'Offspring failed: ' + translateErrorCode(newName) + '<br/> - body: ' + JSON.stringify(_.countBy(body)) + '<br/> - name: ' + name + '<br/> - type:  ' + type + '<br/> - destiny: ' + destiny) );
            return false;
        };
        Spawn.loop = function(){
            var loop = spawn => {
                if(spawn.room.my) spawn.loop();
            }
            _.forEach(Game.spawns, loop);
        }
    }
};

module.exports = mod;
