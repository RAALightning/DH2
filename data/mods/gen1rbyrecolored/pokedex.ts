export const Pokedex: {[k: string]: ModdedSpeciesData} = {
	alakazam: {
		inherit: true,
		baseStats: {hp: 55, atk: 50, def: 45, spa: 145, spd: 145, spe: 120},
	},
	venusaur: {
		inherit: true,
		types: ["Grass"],
		baseStats: {hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80},
	},
	gyarados: {
		inherit: true,
		types: ["Water", "Flying"],
		baseStats: {hp: 95, atk: 130, def: 79, spa: 105, spd: 105, spe: 81},
	},
	arcanine: {
		inherit: true,
		types: ["Fire"],
		baseStats: {hp: 95, atk: 125, def: 79, spa: 100, spd: 100, spe: 81},
	},
}
