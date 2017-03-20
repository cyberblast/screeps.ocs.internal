let mod = {
	FILL_NUKER: false,
	CONTROLLER_SIGN: true,
	CONTROLLER_SIGN_MESSAGE: `Territory of ${_.chain(Game.spawns).values().first().get('owner.username').value()}, an Open Collaboration Society member! (https://github.com/ScreepsOCS)`,
};
module.exports = mod;