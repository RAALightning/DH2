export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
    restlessfungus: {
		name: "Restless Fungus",
		spritenum: 595,
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			return false;
		},
		itemUser: ["Paras","Parasect"],
		num: -1,
		gen: 2,
	},
};