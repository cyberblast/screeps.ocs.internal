let mod = {};
module.exports = mod;
/* maininjection:
mod.stats.creep.armorParts = ...
 */
// 3 layers: armor (combat buffer), hull (movement buffer), core
// depending on shape core parts may count as armor
mod.getCombatStats = function(body) {
    let i = 0;

    let armor = 99;
    let hullHits = body.length * 100 - 99;
    while (i < body.length) {
        if (!mod.stats.creep.armorParts[body[i++].type]) {
            break;
        }
        armor = armor + (mod.stats.creep.boost.hits[body[i++].boost] || 100);
        hullHits = hullHits - 100;
    }

    let hull = armor;
    let coreHits = hullHits;
    while (i < body.length) {
        if (mod.stats.creep.coreParts[body[i++].type]) {
            break;
        }
        hull = hull + (mod.stats.creep.boost.hits[body[i++].boost] || 100);
        coreHits = coreHits - 100;
    }

    return { armor, hullHits, hull, coreHits };
};
