var mod = {
    defense: require('./task.defense'),
    exploit: require('./task.exploit'),
    bodyCosts: function (body) {
        let costs = 0;
        if (body) {
            body.forEach(function (part) {
                costs += BODYPART_COST[part];
            });
        }
        return costs;
    },
    multi: function (room, fixedBody, multiBody) {
        let fixedCosts = Task.bodyCosts(fixedBody);
        let multiCosts = Task.bodyCosts(multiBody);
        let max = Math.floor((50 - fixedBody.length) / multiBody.length);
        return _.min([Math.floor((room.energyCapacityAvailable - fixedCosts) / multiCosts), max]);
    },
    bodyparts: function (room, fixedBody, multiBody) {
        var parts = [];
        let multi = Task.multi(room, fixedBody, multiBody);
        for (let iMulti = 0; iMulti < multi; iMulti++) {
            parts = parts.concat(multiBody);
        }
        for (let iPart = 0; iPart < fixedBody.length; iPart++) {
            parts[parts.length] = fixedBody[iPart];
        }
        /*if( this.sortedParts ) {
            parts.sort(this.partsComparator);
            if( this.mixMoveParts )
                parts = this.mixParts(parts);
            else if( parts.includes(HEAL) ) {
                let index = parts.indexOf(HEAL);
                parts.splice(index, 1);
                parts.push(HEAL);
            }
        }*/
        return parts;
    },
    loop: function () {
        let tasks = [
            Task.defense,
            Task.exploit
        ];
        var loop = task => {
            task.checkForRequiredCreeps();
        }
        _.forEach(tasks, loop);
    }
};
module.exports = mod;