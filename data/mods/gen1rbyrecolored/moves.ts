export const Moves: {[k: string]: ModdedMoveData} = {
	dreameater: {
		num: 138,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Dream Eater",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1, heal: 1, metronome: 1},
		drain: [1, 2],
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
}
