let mod = {
    extend: function() {


        Object.defineProperties(RoomPosition.prototype, {
            'terrain': {
                configurable:true,
                get:function () {
                    if (_.isUndefined(this._terrain)){
                        this._terrain = this.lookFor(LOOK_TERRAIN)[0];
                    }
                    return this._terrain;
                }
            },
            'constructionSites':{
                configurable:true,
                get:function () {
                    if (_.isUndefined(this._constructionSites))
                        this._constructionSites = this.lookFor(LOOK_CONSTRUCTION_SITES);

                    return this._constructionSites || [];
                }
            },
            'structures':{
                configurable:true,
                get:function () {
                    if(_.isUndefined(this._structuresAll))
                        this._structuresAll = this.lookFor(LOOK_STRUCTURES);
                    return this._structuresAll.filter( s => s.structureType != STRUCTURE_ROAD );
                }
            },
            'road':{
                configurable:true,
                get:function () {
                    if(_.isUndefined(this._structuresAll))
                        this._structuresAll = this.lookFor(LOOK_STRUCTURES);
                    return this._structuresAll.filter(s => s.structureType == STRUCTURE_ROAD);
                }
            }
        });

        RoomPosition.prototype.isBuildable = function () {
            return this.terrain != "wall";
        };

        RoomPosition.prototype.isOpen = function ( includingRoad = false) {
            return this.isBuildable() &&
                this.structures.length == 0 &&
                this.constructionSites.length ==0 &&
                (!includingRoad || !this.hasRoad());
        };
        
        RoomPosition.prototype.hasRoad = function () {
            return this.road.length > 0;
        }


        RoomPosition.prototype.getPositionsInRange = function ( range ) {
            let x1 = Math.max(this.x - range, 0);
            let y1 = Math.max(this.y - range, 0);
            let x2 = Math.min(this.x + range, 49);
            let y2 = Math.min(this.y + range, 49);
            let ret = [];
            for (var xi = x1; xi <= x2; xi++)
                for (var yi = y1; yi <= y2; yi ++){
                    let t = new RoomPosition(xi,yi,this.roomName);
                    if (t.getRangeTo(this) == range)
                        ret.push(t);
                }
            return ret;
        };

        RoomPosition.prototype.getOpenPositonsInRange = function (range) {
            return this.getPositionsInRange(range).filter( p => p.isOpen());
        };
    },

};
module.exports = mod;
