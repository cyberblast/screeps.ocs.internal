let mod = {};
module.exports = mod;
mod.minControllerLevel = 7;
mod.register = () => {
    // when a new flag has been found (occurs every tick, for each flag)
    Flag.found.on( flag => Task.train.handleFlagFound(flag) );
    // when a flag has been removed
    Flag.FlagRemoved.on( flagName => Task.train.handleFlagRemoved(flagName) );
    // a creep starts spawning
    Creep.spawningStarted.on( params => Task.train.handleSpawningStarted(params) );
};
mod.checkFlag = (flag) => {
    if( (flag.color == FLAG_COLOR.trainHeal.color && flag.secondaryColor == FLAG_COLOR.trainHeal.secondaryColor) || (flag.color == FLAG_COLOR.trainTurret.color && flag.secondaryColor == FLAG_COLOR.trainTurret.secondaryColor) ) {
        flag.memory.roomName = flag.pos.roomName;
        flag.memory.task = 'train';
        return true;
    }
    return false;
};
mod.handleFlagRemoved = flagName => {
    // check flag
    let flagMem = Memory.flags[flagName];
    if( flagMem && flagMem.task === 'train' && flagMem.roomName ){
        // if there is still a train flag in that room ignore. 
        let flags = FlagDir.filter((FLAG_COLOR.trainHeal || FLAG_COLOR.trainTurret), new RoomPosition(25,25,flagMem.roomName), true);
        if( flags && flags.length > 0 ) 
            return;
        else {
            // no more train in that room. 
            // clear memory
            Task.clearMemory('train', flagMem.roomName);
        }
    }
};
mod.handleFlagFound = flag => {
    // Analyze Flag
    if( Task.train.checkFlag(flag) ){
        // check if a new creep has to be spawned
        Task.train.checkForRequiredCreeps(flag);
    }
};
// remove creep from task memory of queued creeps
mod.handleSpawningStarted = params => {
    if ( !params.destiny || !params.destiny.task || params.destiny.task != 'train' )
        return;
    let memory = Task.train.memory(params.destiny.room);
    if( memory.queued[params.destiny.type] ) memory.queued[params.destiny.type].pop();
    else if( params.destiny.role ) {
        // temporary migration
        if( params.destiny.role == "follower1" ) params.destiny.type = 'follower1';
        else if( params.destiny.role == "leader" ) params.destiny.type = 'leader';
        else if( params.destiny.role == "follower2" ) params.destiny.type = 'follower2';
        memory.queued[params.destiny.type].pop();
    }
};
// check if a new creep has to be spawned
mod.checkForRequiredCreeps = (flag) => {
    let spawnRoom = flag.pos.roomName;
    const roomName = flag.pos.roomName;
    const room = Game.rooms[roomName];
    // Use the roomName as key in Task.memory?
    // Prevents accidentally processing same room multiple times if flags > 1
    let memory = Task.train.memory(roomName);

    let trainCount = 1;

    // TODO: don't iterate/filter all creeps (3 times) each tick. store numbers into memory (see guard tasks)
    let follower1Count = memory.queued.follower1.length + _.filter(Game.creeps, function(c){return c.data && c.data.creepType=='follower1' && c.data.destiny.room==roomName;}).length;
    let existingleaders = _.filter(Game.creeps, function(c){return c.data && c.data.creepType=='leader' && c.data.destiny.room==roomName;});
    let leaderCount = memory.queued.leader.length + existingleaders.length;
    let follower2Count = memory.queued.follower2.length + _.filter(Game.creeps, function(c){return c.data && c.data.creepType=='follower2' && c.data.destiny.room==roomName;}).length;
    
    //console.log("leaders " + leaderCount + " F1's " + follower1Count + " F2's " + follower2Count)

    if( DEBUG && TRACE ) trace('Task', {task:mod.name, flagName:flag.name, room:spawnRoom.name, follower1Count, leaderCount, follower2Count, Task:'Flag.found'}, 'checking flag@', flag.pos);

    if(leaderCount < trainCount) {
        for(let i = leaderCount; i < trainCount; i++) {
            Task.spawn(
                Task.train.creep.destroyer, // creepDefinition
                { // destiny
                    task: 'train', // taskName
                    targetName: flag.name, // targetName
                    type: 'leader' // custom
                }, 
                { // spawn room selection params
                    targetRoom: flag.pos.roomName, 
                    explicit: flag.pos.roomName,
                    minEnergyCapacity: 300
                },
                creepSetup => { // onQueued callback
                    let memory = Task.train.memory(creepSetup.destiny.room);
                    memory.queued[creepSetup.behaviour].push({
                        room: flag.pos.roomName,
                        name: 'Leader'
                    });
                }
            );
        }
    }
    // only spawn followers when a leader has been spawned 
    let runningleaders = _.filter(existingleaders, creep => creep.spawning === false);
    let maxfollowers = 1;

        if(follower1Count < leaderCount) {
        for(let i = follower1Count; i < leaderCount; i++) {
            Task.spawn(
                Task.train.creep.healer, // creepDefinition
                { // destiny
                    task: 'train', // taskName
                    targetName: flag.name, // targetName
                    type: 'follower1'// custom
                }, 
                { // spawn room selection params
                    targetRoom: flag.pos.roomName, 
                    explicit: flag.pos.roomName,
                    minEnergyCapacity: 300
                },
                creepSetup => { // onQueued callback
                    let memory = Task.train.memory(creepSetup.destiny.room);
                    memory.queued.follower1.push({
                        room: flag.pos.roomName,
                        name: 'Follower1'
                    });
                }
            );
        }
    }

    //TODO: Add flag options for different train types to switch the creep spawned

    let reqCreep = Task.train.creep.healer;
    if( flag.color == FLAG_COLOR.trainTurret.color && flag.secondaryColor == FLAG_COLOR.trainTurret.secondaryColor ) { 
        reqCreep = Task.train.creep.rangedAttacker;
    }

       if(follower2Count < follower1Count) {
        for(let i = follower2Count; i < follower1Count; i++) {
            Task.spawn(
                reqCreep, // creepDefinition
                { // destiny
                    task: 'train', // taskName
                    targetName: flag.name, // targetName
                    type: 'follower2' // custom
                }, 
                { // spawn room selection params
                    targetRoom: flag.pos.roomName, 
                    explicit: flag.pos.roomName,
                    minEnergyCapacity: 300
                },
                creepSetup => { // onQueued callback
                    let memory = Task.train.memory(creepSetup.destiny.room);
                    memory.queued.follower2.push({
                        room: flag.pos.roomName,
                        name: 'Follower2'
                    });
                }
            );
        }
    }

/*   // Work in progress
    if( leaderCount == 1){
        // ensure room has a follow flag
        let pos = new RoomPosition(25, 25, flag.pos.roomName);
        let flag = FlagDir.find(FLAG_COLOR.trainFollow, pos, true);
        if( !flag ){
            room.createFlag(pos, null, FLAG_COLOR.trainFollow.color, FLAG_COLOR.trainFollow.secondaryColor);
        }
    }

    if( leaderCount + follower1Count + follower2Count == 3){
       let spawnFlag = FlagDir.find((FLAG_COLOR.trainHeal || FLAG_COLOR.trainTurret), creep.pos, true) ;
        // and has spawn flag
        if( spawnFlag ) {
            // but spawn is complete
            spawnFlag.remove();
        }
    }
*/
  

};
mod.memory = key => {
    let memory = Task.memory('train', key);
    if( !memory.hasOwnProperty('queued') ){
        memory.queued = {
            leader:[], 
            follower1:[], 
            follower2:[]
        };
    }

    // temporary migration
    /*if( memory.queued.leader ){
        memory.queued.leader = memory.queued.leader;
        delete memory.queued.leader;
    }
    if( memory.queued.follower1 ){
        memory.queued.follower1 = memory.queued.follower1;
        delete memory.queued.follower1;
    }
    if( memory.queued.follower2 ){
        memory.queued.follower2 = memory.queued.follower2;
        delete memory.queued.follower2;
    }
    */
    return memory;
};
mod.creep = {
    destroyer: {
        fixedBody: [MOVE, WORK],
        multiBody: [MOVE, WORK],
        name: 'Leader',
        behaviour: 'leader',
        queue: 'Low'
    },
    healer: {
        fixedBody: [MOVE, HEAL],
        multiBody: [MOVE, HEAL], 
        name: 'Follower',
        behaviour: 'follower',
        queue: 'Low'
    },
    rangedAttacker: {
        fixedBody: [MOVE, RANGED_ATTACK],
        multiBody: [MOVE, RANGED_ATTACK], 
        name: 'Follower',
        behaviour: 'follower',
        queue: 'Low'
    }
};
