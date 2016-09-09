var mod = {
    extend: function(){
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
        Object.defineProperty(Source.prototype, 'accessibleFields', {
            configurable: true,
            get: function() {
                if( _.isUndefined(this.memory.accessibleFields) ) {
                    var fields = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
                    let walls = _.countBy( fields , "terrain" ).wall;
                    this.memory.accessibleFields = walls === undefined ? 9 : 9-walls;
                }
                return this.memory.accessibleFields;
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

        //find optimum position for miners deposit conteiner
        //1. its accesable by most mining spots
        //2. has shortest path to controller
        Source.prototype.findConteinerSpot = function () {
            let accesableSpots = this.pos.getOpenPositonsAtRange(1);
            let conteinerSpots = this.pos.getOpenPositionsInRange(2);
            let nextTo = conteinerSpots.map((e,i) => { return {i:i,c: e.getNextToFrom(accesableSpots).length};})
            .filter(e => e.c >0 ).sort((a,b) => b.c - a.c);
            let t = nextTo.filter(e => e.c == nextTo[0].c)
                .map(e => { e.pathLen =conteinerSpots[e.i].findPathTo(this.room.controller.pos,{ignoreCreeps:true}).length; return e; } )
                .sort((a,b) => a.pathLen - b.pathLen);


            //t.forEach(e => console.log(conteinerSpots[e.i],e.c ,e.pathLen));

            return conteinerSpots[t[0].i];
        }

    }
}
module.exports = mod;
