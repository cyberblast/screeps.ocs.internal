module.exports = {
    name: 'remoteMiner',
    approach: function(creep){
        let targetPos = new RoomPosition(creep.data.determinatedSpot.x, creep.data.determinatedSpot.y, creep.pos.roomName);
        let range = creep.pos.getRangeTo(targetPos);
        if( range > 0 )
            creep.drive( targetPos, 0, 0, range );
        return range;
    },
    run: function(creep) {
        let source;
        let memSource;
        let flag;
        let taskMemory;
        let notDeterminated = (source) => { 
            let hasThisSource = data => { return data.determinatedTarget == source.id };
            let existingBranding = _.find(Memory.population, hasThisSource);
            return !existingBranding;
        };
        if (creep.data && creep.data.destiny.flagName) flag = Game.flags[creep.data.destiny.flagName];
        if (flag) taskMemory = Task.remoteMiner.memory(flag);

        if( !creep.data.determinatedTarget && taskMemory && taskMemory.sources ) { // select source from memory
            memSource = _.find(taskMemory.sources, notDeterminated);
            if( memSource ) {
                creep.data.determinatedTarget = memSource.id;
            }
        } 

        if ( flag ) {
            if( flag.pos.roomName != creep.pos.roomName ){
                if ( !creep.action || !creep.action.name != "travelling") {
                    if (creep.data.determinedTarget && taskMemory) {
                        memSource = _.find(taskMemory.sources, {id: creep.data.determinedTarget});
                        Creep.action.travelling.assign(creep, memSource);
                    } else 
                        Creep.action.travelling.assign(creep, flag);

                    Population.registerCreepFlag(creep, flag);
                }
                if ( creep.action && creep.action.name == "travelling")
                    creep.action.step(creep);
                return true;
            }
        }

        if ( creep.data.newContainerConstruction ) {
            delete( creep.data.newContainerConstruction );
            let newContainers = creep.room.lookForAt(
                            LOOK_CONSTRUCTION_SITES,
                            creep.data.determinatedSpot.x,
                            creep.data.determinatedSpot.y
                        );
            if ( newContainers ) {
                creep.data.containerConstruction = newContainers[0].id;
            }
        }

        if( !creep.data.determinatedTarget ) { // select source by room
            source = _.find(creep.room.sources, notDeterminated);
            if( source ) 
                creep.data.determinatedTarget = source.id;

            if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9935), SAY_PUBLIC);
        } else  // get dedicated source
            source = Game.getObjectById(creep.data.determinatedTarget);
        
        if( source ) {
            if( taskMemory && !taskMemory.sources ) Task.remoteMiner.saveSources(flag);
            if( !creep.action ) Population.registerAction(creep, Creep.action.harvesting, source);
            if( !creep.data.determinatedSpot ) {
                let args = {
                    spots: [{
                        pos: source.pos,
                        range: 1
                    }],
                    checkWalkable: true,
                    where: null,
                    roomName: creep.pos.roomName
                }

                let invalid = [];
                let findInvalid = entry => {
                    if( entry.roomName == args.roomName && ['miner', 'upgrader'].includes(entry.creepType) && entry.determinatedSpot && entry.ttl > entry.spawningTime)
                        invalid.push(entry.determinatedSpot)
                };
                _.forEach(Memory.population, findInvalid);
                args.where = pos => { return !_.some(invalid,{x:pos.x,y:pos.y}); };

                if( source.container ) {
                    args.spots.push({
                        pos: source.container.pos,
                        range: 1
                    });
                }
                let spots = Room.fieldsInRange(args);
                if( spots.length > 0 ){
                    let spot = creep.pos.findClosestByPath(spots, {filter: pos => {
                        return !_.some(
                            creep.room.lookForAt(LOOK_STRUCTURES, pos),
                            {'structureType': STRUCTURE_ROAD }
                        );
                    }})
                    if( !spot ) spot = creep.pos.findClosestByPath(spots) || spots[0];
                    if( spot ) creep.data.determinatedSpot = {
                        x: spot.x,
                        y: spot.y
                    }
                }
                if( !creep.data.determinatedSpot ) { 
                    logError('Unable to determine working location for miner in room ' + creep.pos.roomName);
                }
            }

            if( creep.data.determinatedSpot ) {
                let carrying = creep.sum;
                
                if( source.container && source.container.sum < source.container.storeCapacity ) {
                    if(CHATTY) creep.say('harvesting', SAY_PUBLIC);
                    let range = this.approach(creep);
                    if( range == 0 ){
                        if( carrying > ( creep.carryCapacity - ( creep.data.body&&creep.data.body.work ? (creep.data.body.work*2) : (creep.carryCapacity/2) ))){
                            if (source.container.hits < MAX_FORTIFY_CONTAINER) {
                                creep.repair(source.container);
                            } else {
                                let transfer = r => { if(creep.carry[r] > 0 ) creep.transfer(source.container, r); };
                                _.forEach(Object.keys(creep.carry), transfer);
                            }
                        }
                        creep.harvest(source);
                    }
                } else {
                    if(CHATTY) creep.say('dropmining', SAY_PUBLIC);
                    let range = this.approach(creep);
                    if( range == 0 ){
                        if( !creep.data.containerConstruction && !source.container ) {
                            let newContainers = creep.room.lookForAt(
                               LOOK_CONSTRUCTION_SITES,
                               creep.data.determinatedSpot.x,
                               creep.data.determinatedSpot.y
                            );
                            if ( newContainers && newContainers[0] ) {
                                creep.data.containerConstruction = newContainers[0].id;
                            } else {
                                creep.room.createConstructionSite(
                                    creep.data.determinatedSpot.x,
                                    creep.data.determinatedSpot.y,
                                    STRUCTURE_CONTAINER
                                );
                            }
                        }
                        if( carrying > ( creep.carryCapacity -
                            ( creep.data.body&&creep.data.body.work ? (creep.data.body.work*2) : (creep.carryCapacity/2) ))) {
                            if( OOPS ) creep.say(String.fromCharCode(8681), SAY_PUBLIC);
                            if( creep.data.containerConstruction ) {
                                let newContainer = Game.getObjectById(creep.data.containerConstruction);
                                if (newContainer instanceof ConstructionSite) {
                                    creep.build(newContainer);
                                } else {
                                    delete(creep.data.containerConstruction);
                                }
                                
                            }
                            /*let drop = r => { if(creep.carry[r] > 0 ) creep.drop(r); };
                            _.forEach(Object.keys(creep.carry), drop);*/
                        }
                        if( source.container && carrying > ( creep.carryCapacity - ( creep.data.body&&creep.data.body.work ? (creep.data.body.work*2) : (creep.carryCapacity/2) )) && source.container.hits < MAX_FORTIFY_CONTAINER) {
                            creep.repair(source.container);
                        }
                        creep.harvest(source);
                    }
                /*} else {
                    Creep.behaviour.worker.run(creep);
                */}
            }
        }
    }
}
