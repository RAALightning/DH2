export const Scripts: ModdedBattleScriptsData = {
    inherit: 'gen1',
    gen: 1,
	 init() {
		// Venusaur
		this.modData("Learnsets", "venusaur").learnset.stunspore = ["1L1"];
		// Gyarados
		this.modData("Learnsets", "gyarados").learnset.razorwind = ["1L1"];
		// Arcanine
		this.modData("Learnsets", "arcanine").learnset.thunderbolt = ["1L1"];
		this.modData("Learnsets", "arcanine").learnset.thunder = ["1L1"];
		this.modData("Learnsets", "arcanine").learnset.earthquake = ["1L1"];
	 },
}
