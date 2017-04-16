const mod = {
    extend() {
        this.baseOf.internalViral.extend();

        Object.defineProperties(Room.prototype, {
            'allyCreeps': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._allyCreeps)) {
                        this._allyCreeps = this.find(FIND_CREEPS, { filter: Task.reputation.allyOwner });
                    }
                    return this._allyCreeps;
                }
            },
            'casualties': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._casualties) ){
                        var isInjured = creep => creep.hits < creep.hitsMax &&
                        (creep.towers === undefined || creep.towers.length == 0);
                        this._casualties = _.chain(this.allyCreeps).filter(isInjured).sortBy('hits').value();
                    }
                    return this._casualties;
                }
            },
            hostileStructureMatrix: {
                configurable: true,
                get: function() {
                    return Util.get(this, '_hostileStructureMatrix', () => {
                        if (Task.reputation.allyOwner(this)) return {};
                        const matrix = {};
                        const getKey = pos => `${String.fromCharCode(32 + pos.x)}${String.fromCharCode(32 + pos.y)}_x${pos.x}-y${pos.y}`;
                        _(this.structures.all)
                            .filter(s => [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_LAB, STRUCTURE_LINK].includes(s.structureType))
                            .forEach(s => {
                                const key = getKey(s.pos);
                                let initValue = 0;
                                initValue += INVASION.HOSTILE_STRUCTURE_MATRIX[s.structureType] || INVASION.HOSTILE_STRUCTURE_MATRIX.default;
                                matrix[key] = (matrix[key] || 0) + initValue;
                                s.pos.radius(3).forEach(pos => {
                                    const key = getKey(pos);
                                    matrix[key] = (matrix[key] || 0) + (initValue - Util.getDistance(s.pos, pos));
                                });
                            }).commit();
                        return matrix;
                    });
                },
            },
        });
    
        Room.prototype.checkPowerBank = function() {
            if (!this.powerBank) return; // no power bank in room
            const currentFlags = FlagDir.count(FLAG_COLOR.powerMining, this.powerBank.pos, false);
            const flagged = FlagDir.find(FLAG_COLOR.powerMining, this.powerBank.pos, false);
            if (!flagged && currentFlags < MAX_AUTO_POWER_MINING_FLAGS) {
                if (this.powerBank.power > 2500 && this.powerBank.ticksToDecay > 4500) {
                    this.powerBank.pos.createFlag(null, FLAG_COLOR.powerMining.color, FLAG_COLOR.powerMining.secondaryColor);
                }
            }
        }
    },
    
    analyze() {
        this.baseOf.internalViral.analyze();
        
        const getEnvironment = room => {
            try {
                if (AUTO_POWER_MINING) room.checkPowerBank();
            } catch(err) {
                Game.notify('Error in internalViral.room.js (Room.prototype.loop) for "' + room.name + '" : ' + err.stack ? err + '<br/>' + err.stack : err);
                console.log( dye(CRAYON.error, 'Error in internalViral.room.js (Room.prototype.loop) for "' + room.name + '": <br/>' + (err.stack || err.toString()) + '<br/>' + err.stack));
            }
        };
        _.forEach(Game.rooms, getEnvironment);
    },
    
};
module.exports = mod;
