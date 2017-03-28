let mod = {
	FILL_NUKER: false,
	CONTROLLER_SIGN: true,
	CONTROLLER_SIGN_MESSAGE: `Territory of ${_.chain(Game.spawns).values().first().get('owner.username').value()}, an Open Collaboration Society member! (https://github.com/ScreepsOCS)`,
        AUTO_POWER_MINING: true, //set to false to disable power mining (recomended until 1-2 RCL8+ rooms)
        MAX_AUTO_POWER_MINING_FLAGS: 2,
        POWER_MINE_LOG: true, //displays power mining info in console
	INVASION: {
		ATTACK_CONTROLLER: true, // will spawn an attack controller once the room has cleared
		GUARDS: true, // will spawn guards to defend hoppers and attack controllers
		HOPPER_COUNT: 2, // amount of hoppers to spawn
		TRAIN_COUNT: 2, // amount of trains to spawn
		ATTACK_CONTROLLER_COUNT: 1, // amount of attack controllers to spawn
		ROBBER_COUNT: 2, // during phases 2 and 3, the invasion will spawn robbers to drain the room
		// amount of guards to spawn. Number or function
		GUARD_COUNT: (phase) => [0, INVASION.HOPPER_COUNT, 0, 1][phase],
		NUKES: false, // whether to nuke during an invasion
		// primary targets for a nuke. Array, STRUCTURE_*, or function
		NUKE_TARGETS: [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL],
	},
};
module.exports = mod;
