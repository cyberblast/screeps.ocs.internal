var mod = {
    extend: function () {
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
        });
    }
    /* No idea how to do this bit
    Room.prototype.checkPowerBank = function() {
    if (!this.powerBank) return; // no power bank in room
    	//power > 2500, and ticksToDecay > 4500
        const currentFlags = FlagDir.count(FLAG_COLOR.powerMining, this.powerBank.pos, false);
    	const flagged = FlagDir.find(FLAG_COLOR.powerMining, this.powerBank.pos, true);
    	if(!flagged && currentFlags < MAX_AUTO_POWER_MINING_FLAGS){
    	    if(this.powerBank.power > 2500 && this.powerBank.ticksToDecay > 4500){
    		    // Place a flag
    		    this.createFlag(this.powerBank.pos, null, FLAG_COLOR.powerMining.color, FLAG_COLOR.powerMining.secondaryColor);
    	    }
        }
    };
    
    mod.analyze extend
    
    if(AUTO_POWER_MINING) room.checkPowerBank();
    
    */
    
    
    
};
module.exports = mod;
