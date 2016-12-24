var mod = {
    extend: function(){
        // Events

        // occurs when a flag is found (each tick)
        // param: flag
        Flag.found = new LiteEvent();

        // occurs when a flag memory if found for which no flag exists (before memory removal)
        // param: flagName
        Flag.FlagRemoved = new LiteEvent();

        // ocurrs when a creep starts spawning
        // param: { spawn: spawn.name, name: creep.name, destiny: creep.destiny }
        Creep.spawningStarted = new LiteEvent();

        // ocurrs when a creep completes spawning
        // param: creep
        Creep.spawningCompleted = new LiteEvent();

        // ocurrs when a creep will die in the amount of ticks required to renew it
        // param: creep
        Creep.predictedRenewal = new LiteEvent();
        
        // ocurrs when a creep dies
        // param: creep name
        Creep.died = new LiteEvent();
        
        Object.defineProperty(Structure.prototype, 'towers', {
            configurable: true,
            get: function() {
                if(_.isUndefined(this._towers) || this._towersSet != Game.time) {
                    this._towersSet = Game.time;
                    this._towers = [];
                }
                return this._towers;
            },
            set: function(value) {
                this._towers = value;
            }
        });
        Object.defineProperty(Source.prototype, 'memory', {
            configurable: true,
            get: function() {
                if(_.isUndefined(Memory.sources)) {
                    Memory.sources = {};
                }
                if(!_.isObject(Memory.sources)) {
                    return undefined;
                }
                return Memory.sources[this.id] = Memory.sources[this.id] || {};
            },
            set: function(value) {
                if(_.isUndefined(Memory.sources)) {
                    Memory.sources = {};
                }
                if(!_.isObject(Memory.sources)) {
                    throw new Error('Could not set memory extension for sources');
                }
                Memory.sources[this.id] = value;
            }
        });
        Object.defineProperty(RoomPosition.prototype, 'adjacent', {
            configurable: true,
            get: function() {
                if( _.isUndefined(this._adjacent) )  {
                    this._adjacent = [];
                    for(x = this.x-1; x < this.x+2; x++){
                        for(y = this.y-1; y < this.y+2; y++){
                            if( x > 0 && x < 49 && y > 0 && y < 49 ){
                                this._adjacent.push(new RoomPosition(x, y, this.roomName));
                            }
                        }
                    }
                }
                return this._adjacent;
            }
        });
        Object.defineProperty(RoomObject.prototype, 'accessibleFields', {
            configurable: true,
            get: function() {
                if ( this.memory && !_.isUndefined(this.memory.accessibleFields) ) {
                    return this.memory.accessibleFields;
                } else {
                    var fields = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
                    let walls = _.countBy( fields , "terrain" ).wall;
                    var accessibleFields = walls === undefined ? 9 : 9-walls;
                    return (this.memory) ? this.memory.accessibleFields = accessibleFields : accessibleFields;
                }
            }
        });
        Object.defineProperty(Source.prototype, 'container', {
            configurable: true,
            get: function() {
                let that = this;
                if( _.isUndefined(this.memory.container)) {
                    this.room.saveContainers();
                };

                if( _.isUndefined(this._container) ) {
                    if( this.memory.storage ) {
                        this._container = Game.getObjectById(this.memory.storage);
                        if( !this._container ) delete this.memory.storage;
                    }
                    else if( this.memory.terminal ) {
                        this._container = Game.getObjectById(this.memory.terminal);
                        if( !this._container ) delete this.memory.terminal;
                    }
                    else if( this.memory.container ) {
                        this._container = Game.getObjectById(this.memory.container);
                        if( !this._container ) delete this.memory.container;
                    } else this._container = null;
                }
                return this._container;
            }
        });
        Object.defineProperty(Mineral.prototype,'memory', {
            configurable: true,
            get: function() {
                if(_.isUndefined(Memory.minerals)) {
                    Memory.minerals = {};
                }
                if(!_.isObject(Memory.minerals)) {
                    return undefined;
                }
                return Memory.minerals[this.id] = Memory.minerals[this.id] || {};
            },
            set: function(value) {
                if(_.isUndefined(Memory.minerals)) {
                    Memory.minerals = {};
                }
                if(!_.isObject(Memory.minerals)) {
                    throw new Error('Could not set memory extension for minerals');
                }
                Memory.minerals[this.id] = value;
            }
        });
        Object.defineProperty(Mineral.prototype, 'container', {
            configurable: true,
            get: function() {
                let that = this;
                if( _.isUndefined(this.memory.container)) {
                    this.room.saveContainers();
                };

                if( _.isUndefined(this._container) ) {
                    if( this.memory.terminal ) {
                        this._container = Game.getObjectById(this.memory.terminal);
                        if( !this._container ) delete this.memory.terminal;
                    }
                    else if( this.memory.storage ) {
                        this._container = Game.getObjectById(this.memory.storage);
                        if( !this._container ) delete this.memory.storage;
                    }
                    else if( this.memory.container ) {
                        this._container = Game.getObjectById(this.memory.container);
                        if( !this._container ) delete this.memory.container;
                    } else this._container = null;
                }
                return this._container;
            }
        });
        Object.defineProperty(Source.prototype, 'link', {
            configurable: true,
            get: function() {
                if( _.isUndefined(this._link) ) {
                    if( this.memory.link ) {
                        this._link = Game.getObjectById(this.memory.link);
                        if( !this._link ) delete this.memory.link;
                    } else this._link = null;
                }
                return this._link;
            }
        });
        Object.defineProperty(StructureController.prototype, 'memory', {
            configurable: true,
            get: function() {
                if(_.isUndefined(Memory.controllers)) {
                    Memory.controllers = {};
                }
                if(!_.isObject(Memory.controllers)) {
                    return undefined;
                }
                return Memory.controllers[this.id] = Memory.controllers[this.id] || {};
            },
            set: function(value) {
                if(_.isUndefined(Memory.controllers)) {
                    Memory.controllers = {};
                }
                if(!_.isObject(Memory.controllers)) {
                    throw new Error('Could not set memory extension for controller');
                }
                Memory.controllers[this.id] = value;
            }
        });
        Object.defineProperty(StructureStorage.prototype, 'sum', {
            configurable: true,
            get: function() {
                if( _.isUndefined(this._sum) || this._sumSet != Game.time ) {
                    this._sumSet = Game.time;
                    this._sum = _.sum(this.store);
                }
                return this._sum;
            }
        });
        Object.defineProperty(StructureTerminal.prototype, 'sum', {
            configurable: true,
            get: function() {
                if( _.isUndefined(this._sum) || this._sumSet != Game.time ) {
                    this._sumSet = Game.time;
                    this._sum = _.sum(this.store);
                }
                return this._sum;
            }
        });
        Object.defineProperty(StructureContainer.prototype, 'sum', {
            configurable: true,
            get: function() {
                if( _.isUndefined(this._sum) || this._sumSet != Game.time ) {
                    this._sumSet = Game.time;
                    this._sum = _.sum(this.store);
                }
                return this._sum;
            }
        });

        if( Memory.pavementArt === undefined ) Memory.pavementArt = {};
    }
}
module.exports = mod;

        /*
        Object.defineProperty(Structure.prototype, 'memory', {
            configurable: true,
            get: function() {
                if(_.isUndefined(Memory.structures)) {
                    Memory.structures = {};
                }
                if(!_.isObject(Memory.structures)) {
                    return undefined;
                }
                return Memory.structures[this.id] = Memory.structures[this.id] || {};
            },
            set: function(value) {
                if(_.isUndefined(Memory.structures)) {
                    Memory.structures = {};
                }
                if(!_.isObject(Memory.structures)) {
                    throw new Error('Could not set memory extension for structures');
                }
                Memory.structures[this.id] = value;
            }
        });
        */