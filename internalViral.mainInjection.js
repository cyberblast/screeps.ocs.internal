let mod = {};
module.exports = mod;
mod.extend = function(){
    try {
        // flags
        global.FLAG_COLOR.powerMining = { // triggers power mining task. Place ON the Power Bank. 
            color: COLOR_RED,
            secondaryColor: COLOR_BROWN,
        };
        global.FLAG_COLOR.hopper = { // the room where tower is
            color: COLOR_RED,
            secondaryColor: COLOR_PURPLE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_PURPLE }
        };
        global.FLAG_COLOR.hopperHome = { // room to heal in
            color: COLOR_RED,
            secondaryColor: COLOR_BLUE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_BLUE }
        };
        global.FLAG_COLOR.sourceKiller ={
            color: COLOR_YELLOW,
            secondaryColor: COLOR_RED,
            filter: {'color': COLOR_YELLOW, 'secondaryColor': COLOR_RED }
        };
        global.FLAG_COLOR.attackTrain = { // placed in room to attack, once there will dismantle/attack orange/yellow flags
            color: COLOR_RED,
            secondaryColor: COLOR_WHITE,
            filter: {'color': COLOR_RED, 'secondaryColor': COLOR_WHITE}
        };
        global.FLAG_COLOR.sequence = { // Place Grey/Grey flag on a structure, all Grey/X flags are changed to X/X flags when the structure is gone.
            color: COLOR_GREY,
            secondaryColor: COLOR_GREY,
            filter: {'color': COLOR_GREY, 'secondaryColor': COLOR_GREY}
        };
        // warrior
        Creep.behaviour.warrior = load("creep.behaviour.warrior");
        //powerMining
        Task.installTask('powerMining');
        Creep.action.pickPower = load("creep.action.pickPower");
        Creep.behaviour.powerMiner = load("creep.behaviour.powerMiner");
        Creep.behaviour.powerHealer = load("creep.behaviour.powerHealer");
        Creep.behaviour.powerHauler = load("creep.behaviour.powerHauler");
        // hopper
        Task.installTask('hopper');
        Creep.behaviour.hopper = load("creep.behaviour.hopper");
        //sourceKiller
        Creep.action.sourceKiller = load("creep.action.sourceKiller");
        Creep.setup.sourceKiller = load("creep.setup.sourceKiller");
        Creep.behaviour.sourceKiller = load("creep.behaviour.sourceKiller");
        // attackTrain
        Creep.setup.trainDestroyer = load("creep.setup.trainDestroyer");
        Creep.setup.trainHealer = load("creep.setup.trainHealer");
        Creep.setup.trainTurret = load("creep.setup.trainTurret");
        Creep.behaviour.trainDestroyer = load("creep.behaviour.trainDestroyer");
        Creep.behaviour.trainHealer = load("creep.behaviour.trainHealer");
        Creep.behaviour.trainTurret = load("creep.behaviour.trainTurret");

        Task.installTask(...[
            "flagSequence",
        ]);

        Spawn.priorityLow.push(Creep.setup.trainDestroyer);
        Spawn.priorityLow.push(Creep.setup.trainHealer);
        // attempt to get around merge conflict, remove once this is in /dev
        if (!_.isUndefined(Creep.setup.sourceKiller)) Spawn.priorityLow.unshift(Creep.setup.sourceKiller);
        Spawn.priorityLow.push(Creep.setup.trainTurret);

        StructureNuker.prototype.getNeeds = function(resourceType) {
            // if parameter is enabled then autofill nukers
            if( FILL_NUKER ) {
                if( resourceType == RESOURCE_ENERGY && this.energy < this.energyCapacity ) {
                    return this.energyCapacity - this.energy;
                }
                if( resourceType == RESOURCE_GHODIUM && this.ghodium < this.ghodiumCapacity ) {
                    return this.ghodiumCapacity - this.ghodium;
                }
                return 0;
            }
            if (!this.room.memory.resources || !this.room.memory.resources.nuker) return 0;
            let loadTarget = 0;
            let unloadTarget = 0;

            // look up resource and calculate needs
            let containerData = this.room.memory.resources.nuker.find( (s) => s.id == this.id );
            if (containerData) {
                let order = containerData.orders.find((o)=>{return o.type==resourceType;});
                if (order) {
                    let amt = 0;
                    if (resourceType == RESOURCE_ENERGY) amt = this.energy;
                    else if (resourceType == RESOURCE_GHODIUM) amt = this.ghodium;
                    loadTarget = Math.max(order.orderRemaining + amt, order.storeAmount);
                    unloadTarget = order.orderAmount + order.storeAmount;
                    if (unloadTarget < 0) unloadTarget = 0;
                }
            }
            let store = 0;
            let space = 0;
            if (resourceType == RESOURCE_ENERGY) {
                store = this.energy;
                space = this.energyCapacity-this.energy;
            } else if (resourceType == RESOURCE_GHODIUM) {
                store = this.ghodium;
                space = this.ghodiumCapacity-this.ghodium;
            }
            if (store < loadTarget) return Math.min(loadTarget-store,space);
            if (store > unloadTarget * 1.05) return unloadTarget-store;
            return 0;
        };

        Room.prototype.prepareResourceOrder = function(containerId, resourceType, amount) {
            let container = Game.getObjectById(containerId);
            if (!this.my || !container || !container.room.name == this.name ||
                    !(container.structureType == STRUCTURE_LAB ||
                    container.structureType == STRUCTURE_POWER_SPAWN ||
                    container.structureType == STRUCTURE_NUKER ||
                    container.structureType == STRUCTURE_CONTAINER ||
                    container.structureType == STRUCTURE_STORAGE ||
                    container.structureType == STRUCTURE_TERMINAL)) {
                return ERR_INVALID_TARGET;
            }
            if (!RESOURCES_ALL.includes(resourceType)) {
                return ERR_INVALID_ARGS;
            }
            if (this.memory.resources === undefined) {
                this.memory.resources = {
                    lab: [],
                    powerSpawn: [],
                    nuker: [],
                    container: [],
                    terminal: [],
                    storage: []
                };
            }
            if (this.memory.resources.powerSpawn === undefined) this.memory.resources.powerSpawn = [];
            if (this.memory.resources.nuker === undefined) this.memory.resources.nuker = [];
            if (!this.memory.resources[container.structureType].find( (s) => s.id == containerId )) {
                this.memory.resources[container.structureType].push(container.structureType==STRUCTURE_LAB ? {
                    id: containerId,
                    orders: [],
                    reactionState: LAB_IDLE
                } : {
                    id: containerId,
                    orders: []
                });
            }
            if (container.structureType == STRUCTURE_LAB && resourceType != RESOURCE_ENERGY && amount > 0) {
                // clear other resource types since labs only hold one at a time
                let orders = this.memory.resources[STRUCTURE_LAB].find((s)=>s.id==containerId).orders;
                for (var i=0;i<orders.length;i++) {
                    if (orders[i].type != resourceType && orders[i].type != RESOURCE_ENERGY) {
                        orders[i].orderAmount = 0;
                        orders[i].orderRemaining = 0;
                        orders[i].storeAmount = 0;
                    }
                };
            }
            return OK;
        };
        Room.prototype.updateResourceOrders = function () {
            let data = this.memory.resources;
            if (!this.my || !data) return;

            // go through reallacation orders and reset completed orders
            for(var structureType in data) {
                for(var i=0;i<data[structureType].length;i++) {
                    let structure = data[structureType][i];
                    // don't reset busy labs
                    if (structureType == STRUCTURE_LAB && structure.reactionState != LAB_IDLE) continue;
                    if (!structure.orders) continue;
                    for(var j=0;j<structure.orders.length;j++) {
                        let order = structure.orders[j];
                        if (order.orderRemaining <= 0) {
                            let baseAmount = 0;
                            let rcl = this.controller.level;
                            if (structureType == STRUCTURE_STORAGE) baseAmount = order.type == RESOURCE_ENERGY ? MIN_STORAGE_ENERGY[rcl] : MAX_STORAGE_MINERAL;
                            else if (structureType == STRUCTURE_TERMINAL) baseAmount = order.type == RESOURCE_ENERGY ? TERMINAL_ENERGY : 0;
                            baseAmount += order.storeAmount;
                            let amount = 0;
                            let cont = Game.getObjectById(structure.id);
                            if (cont && structureType == STRUCTURE_LAB) {
                                switch (structureType) {
                                    case STRUCTURE_LAB:
                                        // get lab amount
                                        if (order.type == cont.mineralType) {
                                            amount = cont.mineralAmount;
                                        } else if (order.type == RESOURCE_ENERGY) {
                                            amount = cont.energy;
                                        }
                                        break;
                                    case STRUCTURE_POWER_SPAWN:
                                        // get power spawn amount
                                        if (order.type == RESOURCE_POWER) {
                                            amount = cont.power;
                                        } else if (order.type == RESOURCE_ENERGY) {
                                            amount = cont.energy;
                                        }
                                        break;
                                    case STRUCTURE_NUKER:
                                        // get nuker amount
                                        if (order.type == RESOURCE_GHODIUM) {
                                            amount = cont.ghodium;
                                        } else if (order.type == RESOURCE_ENERGY) {
                                            amount = cont.energy;
                                        }
                                        break;
                                    default:
                                        // get stored amount
                                        amount = cont.store[order.type] || 0;
                                        break;
                                }
                            }
                            if (amount < baseAmount) {
                                order.orderAmount = 0;
                                order.orderRemaining = 0;
                            }
                        }
                    }
                }
            }
        };
        // combat effectiveness calc TODO Population.extend()
        Population.stats.creep.armorParts = { // combat buffer
            [TOUGH]: true,
            [MOVE]: true,
            [CARRY]: true,
        };
        Population.stats.creep.coreParts = { // run away
            [MOVE]: true,
            [HEAL]: true,
        };
    }
    catch(e){
        console.log(e.stack || e);
    }
};
//mod.flush = function(){};
//mod.analyze = function(){};
//mod.register = function(){};
//mod.execute = function(){};
//mod.cleanup = function(){};
