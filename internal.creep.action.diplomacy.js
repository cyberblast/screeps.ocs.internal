const action = class extends Creep.Action {
    
    isValidAction(creep) {
        return _.isUndefined(creep.data.diplomacyGame) || (_.some(creep.room.allCreeps, creep => creep.owner.username !== ME) && creep.room.powerBank && !creep.room.powerBank.cloak);
    }
    
    isValidTarget(target) {
        return target instanceof Creep && Task.reputation.allyOwner(target);
    }
    
    newTarget(creep) {
        return _(creep.room.allCreeps)
            .filter(creep => {
                return creep.owner.username !== ME && task.reputation.allyOwner(creep);
            })
            .find(creep => creep.getActiveBodyparts(ATTACK) >= 20);
    }
    
    step(creep) {
        if (creep.room.name !== creep.data.destiny.room) return super.step(creep);
        this.chatty(creep);
        const dispute = this.handleDispute(creep);
        if (dispute === 1) { // dispute lost
            creep.room.powerBank.cloak = Infinity;
            Game.flags[creep.data.destiny.targetName].remove();
            return;
        } else if (dispute === 2) { // dipute won
            return Creep.action.harvestPower.assign(creep);
        }
        const target = creep.room.powerBank;
        const targetRange = Creep.action.harvestPower.targetRange;
        const reachedRange = Creep.action.harvestPower.reachedRange;
        const range = creep.pos.getRangeTo(target);
        if (range <= targetRange) {
            return;
        }
        if (range > targetRange) {
            creep.travelTo(creep.room.powerBank, {range: targetRange});
        } else if (range > reachedRange) {
            const direction = creep.pos.getDirectionTo(target);
            const targetPos = Traveler.positionAtDirection(creep.pos, direction);
            if (creep.room.isWalkable(targetPos.x, targetPos.y)) {
                creep.move(direction);
            } else {
                creep.travelTo(target, {range: reachedRange});
            }
        }
    }
    
    handleDispute(creep) {
        const target = creep.target;
        const play = creep.data.play;
        const game = {
            [String.fromCodePoint(0x2702)]: String.fromCodePoint(0x1F4DC),  // scissors beats paper
            [String.fromCodePoint(0x1F4DC)]: String.fromCodePoint(0x1F48E), // paper beats rock
            [String.fromCodePoint(0x1F48E)]: String.fromCodePoint(0x2702),  // rock beats scissors
        };
        if (play) {
            const allyPlay = target.saying;
            if (!allyPlay || allyPlay === play) {
                Util.logSystem(creep.room.name, 'POWER: we had a tie!');
                creep.say('Tie!', true);
                delete creep.data.play;
            } else if (game[play] === allyPlay) {
                Util.logSystem(creep.room.name, 'POWER: we won!');
                creep.say('Yay!', true);
                creep.data.displomacyGame = creep.target.owner.username;
                return 2;
            } else if (allyPlay in game) {
                Util.logSystem(creep.room.name, 'POWER: we lost.');
                creep.say('Damn!', true);
                this.unregister(creep);
                return 1;
            }
        } else {
            Util.logSystem(creep.room.name, 'POWER: ally found.', 'Playing a game to find out who gets power.');
            const play = Object.keys(game)[_.random(2)];
            creep.data.play = play;
            creep.say(play, true);
        }
        return 0;
    }
    
    unregister(creep) {
        creep.data.diplomacyGame = creep.target.owner.username;
        delete creep.action;
        delete creep.target;
    }
    
};
module.exports = new action('diplomacy');