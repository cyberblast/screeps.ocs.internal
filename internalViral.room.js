const mod = {
    extend() {
        this.baseOf.internalViral.extend.call(this);

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
    },
    
};
module.exports = mod;
