var Action = function(actionName){
    this.name = actionName;
    this.maxPerTarget = 1;
    this.maxPerAction = 1;
    this.targetRange = 1;
    this.reachedRange = 1;
    this.renewTarget = true;
    this.getTargetId = function(target){ 
        return target.id || target.name;
    };
    this.getTargetById = function(id){
        return Game.getObjectById(id) || Game.spawns[id] || Game.flags[id];
    };
    this.isValidAction = function(creep){
        return true;
    };
    this.isValidTarget = function(target){
        return (target != null);
    };
    this.isAddableAction = function(creep){
        return (!creep.room.population || !creep.room.population.actionCount[this.name] || creep.room.population.actionCount[this.name] < this.maxPerAction);
    };
    this.isAddableTarget = function(target){ // target is valid to be given to an additional creep
        return (!target.targetOf || target.targetOf.length < this.maxPerTarget);
    };
    this.newTarget = function(creep){
        return null;
    };
    this.step = function(creep){
        if(CHATTY) creep.say(this.name, SAY_PUBLIC);
        let range = creep.pos.getRangeTo(creep.target);
        if( range <= this.targetRange ) {
            var workResult = this.work(creep);
            if( workResult != OK ) {
                if( DEBUG ) logErrorCode(creep, workResult);
                creep.data.actionName = null;
            }
        } 
        this.drive(creep, creep.target.pos, range, this.reachedRange, this.targetRange);
    };
    this.work = function(creep){
        return ERR_INVALID_ARGS;
    };
    this.drive = function(creep, targetPos, range, reachedRange, enoughRange) {
        // temporary cleanup
        if( creep.data.path ) delete creep.data.path;
        if( !targetPos || range <= reachedRange || creep.fatigue > 0 ) return;
        let lastPos = creep.data.lastPos;
        creep.data.lastPos = new RoomPosition(creep.pos.x, creep.pos.y, creep.pos.roomName);

        if( creep.data.moveMode == null || 
            (lastPos && // moved
            (lastPos.x != creep.pos.x || lastPos.y != creep.pos.y || lastPos.roomName != creep.pos.roomName)) 
        ) {
            // at this point its sure, that the creep DID move in the last loop. 
            // from lastPos to creep.pos 
            creep.room.recordMove(creep);

            if( creep.data.moveMode == null) 
                creep.data.moveMode = 'auto';
            if( creep.data.route && creep.data.route.path.length > 1 ){
                creep.data.route.path.shift();
                if( lastPos.roomName != creep.pos.roomName )
                    creep.data.route.path.shift();
            }
            else 
                creep.data.route = this.getPath(creep.pos, targetPos, reachedRange);

            if( creep.data.route && creep.data.route.path.length > 0 ) {
                let moveResult = creep.moveByPath([new RoomPosition(creep.data.route.path[0].x,creep.data.route.path[0].y,creep.data.route.path[0].roomName)]);
                if( moveResult == OK ) { // OK is no guarantee that it will move to the next pos. 
                    creep.data.moveMode = 'auto'; 
                } else logErrorCode(creep, moveResult);
            } else if( range > enoughRange ) {
                creep.say('NO PATH!');
                creep.data.targetId = null;
            }
        } else if( creep.data.moveMode == 'auto' ) {
            // try again to use path.
            if( range > enoughRange ) {
                if( HONK ) creep.say('HONK', SAY_PUBLIC);
                creep.data.moveMode = 'evade';
            }
            if( !creep.data.route || creep.data.route.path.length == 0 )
                creep.data.route = this.getPath(creep.pos, targetPos, reachedRange);

            if( creep.data.route && creep.data.route.path.length > 0 ) {
                //let moveResult = creep.moveByPath(creep.data.route.path);
                let moveResult = creep.moveByPath([new RoomPosition(creep.data.route.path[0].x,creep.data.route.path[0].y,creep.data.route.path[0].roomName)]);
                if( moveResult != OK ) logErrorCode(creep, moveResult);
            } else if( range > enoughRange ) {
                creep.say('NO PATH!');
                creep.data.targetId = null;
            }
        } else { // evade
            // get path (don't ignore creeps)
            // try to move. 
            if( HONK ) creep.say('HONK', SAY_PUBLIC);
            delete creep.data.route;            
            creep.data.route = this.getPath(creep.pos, targetPos, reachedRange, true);

            if( creep.data.route && creep.data.route.path.length > 0 ) {
                if( creep.data.route.path.length > 5 ) 
                    creep.data.route.path = creep.data.route.path.slice(0, 5);
                //let moveResult = creep.moveByPath(creep.data.route.path);
                let moveResult = creep.moveByPath([new RoomPosition(creep.data.route.path[0].x,creep.data.route.path[0].y,creep.data.route.path[0].roomName)]);
                if( moveResult != OK ) logErrorCode(creep, moveResult);
            } else if( range > enoughRange ) {
                creep.say('NO PATH!'); 
                creep.data.targetId = null;
            }
        }
    };
    this.getPath = function(originPos, goalPos, reachedRange = 0, evade = false) {
        let goals;
        let setRange = g => {
            return reachedRange != 0 ? {
                pos: g, 
                range: reachedRange
            } : g;
        }
        //if( Array.isArray(goalPos) ) {
        //    goals = goalPos.map(setRange);
        //} else {
            goals = setRange(goalPos);
        //}
        let validRoomNames = this.getRoute(originPos.roomName, goalPos.roomName);
        
        let that = this;
        let route = PathFinder.search(
            originPos, goals, {
                plainCost: 4,
                swampCost: 10,
                heuristicWeight: 1.4,
                maxRooms: 7,
                roomCallback: function(roomName) {
                    if( !validRoomNames.includes(roomName) ) 
                        return false;
                    let costs = that.staticCostMatrix(roomName);
                    if( evade && roomName == originPos.roomName ) {
                        let room = Game.rooms[roomName];
                        room.find(FIND_CREEPS).forEach(function(creep) {
                            costs.set(creep.pos.x, creep.pos.y, 0xff);
                        });
                    } 
                    return costs;
                }
        });
        if( route.path.length > 0 ) route.path.push(goalPos);
        return route;
    };
    this.getRoute = function(fromRoom, toRoom){
        if (fromRoom != toRoom) {
            let rooms = Game.map.findRoute(fromRoom, toRoom, {
                routeCallback(roomName) {
                    let isHighway = roomName.includes('0');
                    let isMyRoom = Game.rooms[roomName] &&
                        Game.rooms[roomName].controller &&
                        Game.rooms[roomName].controller.my;
                    let isExploitationRoom = FlagDir.find(FLAG_COLOR.invade.exploit, new RoomPosition(25, 28, roomName), true);
                    if (isHighway || isMyRoom || isExploitationRoom) {
                        return 1;
                    } else {
                        return 30;
                    }
                }
            });
            return rooms ? rooms.map(r => r.room) : [];
        } else return [fromRoom];
    };
    this.staticCostMatrix = function(roomName) {
        var room = Game.rooms[roomName];
        if(!room) {
            return;
        }
    
        Memory.pathfinder = Memory.pathfinder || {};
        Memory.pathfinder[roomName] = Memory.pathfinder[roomName] || {};
    
        if(Memory.pathfinder[roomName].costMatrix && (Game.time - Memory.pathfinder[roomName].updated) < 500) {
            return PathFinder.CostMatrix.deserialize(Memory.pathfinder[roomName].costMatrix);
        }
    
        var costMatrix = new PathFinder.CostMatrix;
    
        var structures = room.find(FIND_STRUCTURES);
        for(var i = 0; i < structures.length; i++) {
            var structure = structures[i];
    
            if(structure.structureType == STRUCTURE_ROAD) {
                costMatrix.set(structure.pos.x, structure.pos.y, 1);
            } else if(structure.structureType !== STRUCTURE_RAMPART || !structure.my) {
                costMatrix.set(structure.pos.x, structure.pos.y, 0xFF);
            }
        }
    
        Memory.pathfinder[roomName].costMatrix = costMatrix.serialize();
        Memory.pathfinder[roomName].updated = Game.time;
        console.log("Recalculated costMatrix for " + roomName);
        return costMatrix;
    };
    this.validateActionTarget = function(creep, target){
        if( this.isValidAction(creep) ){ // validate target or new
            if( !this.isValidTarget(target)){ 
                if( this.renewTarget ){ // invalid. try to find a new one...
                    creep.data.moveMode = null;
                    delete creep.data.route;
                    return this.newTarget(creep);
                }
            } else return target;
        } 
        return null;
    };
    this.assign = function(creep, target){
        if( target === undefined ) target = this.newTarget(creep);
        if( target != null ) {
            Population.registerAction(creep, this, target);
            return true;
        }
        return false;
    }
}
module.exports = Action;
