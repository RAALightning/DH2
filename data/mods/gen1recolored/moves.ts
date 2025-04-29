export const Moves: {[k: string]: ModdedMoveData} = {
	aurorabeam: {
		inherit: true,
		basePower: 100,
	},
	dreameater: {
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		desc: "User gains 1/2 HP inflicted.",
		shortDesc:  "User gains 1/2 HP inflicted.",
		name: "Dream Eater",
		pp: 10,
		priority: 0,
		flags: {heal: 1},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dream Eater", target);
		},
		drain: [1, 2],
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
	fireblast: {
		inherit: true,
		accuracy: 90,
	},
	thunder: {
		inherit: true,
		accuracy: 85,
	},
	flamethrower: {
		inherit: true,
		basePower: 100,
	},
	hydropump: {
		inherit: true,
		accuracy: 90,
	},
	glare: {
		inherit: true,
		accuracy: 85,
		basePower: 0,
		category: "Status",
		name: "Glare",
		pp: 30,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1, metronome: 1},
		status: 'par',
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	rockslide: {
		inherit: true,
		basePower: 85,
		accuracy: 100,
	},
	hurricane: {
		inherit: true,
		gen: 1,
		accuracy: 90,
		basePower: 100,
		category: "Physical",
		name: "Hurricane",
		desc: "No additional effect",
		shortDesc:  "No additional effect",
		pp: 10,
		priority: 0,
		secondary: null,
		target: "normal",
		type: "Flying",
	},
	superkinesis: {
		gen: 1,
		accuracy: 100,
		basePower: 0,
		category: "Status",
		name: "Super Kinesis",
		desc: "Lowers the target's attack by 2.",
		shortDesc:  "Lowers the target's attack by 2",
		pp: 5,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1, metronome: 1},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Kinesis", target);
		},
		boosts: {
			atk: -2,
		},
		secondary: null,
		target: "normal",
		type: "Psychic",
	},
	rollout: {
		gen: 1,
		accuracy: 90,
		basePower: 100,
		name: "Rollout",
		category: "Physical",
		desc: "No additional effect",
		shortDesc:  "No additional effect",
		pp: 10,
		priority: 0,
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Rollout", target);
		},
		secondary: null,
		target: "normal",
		type: "Rock",
	},
	pinmissile: {
		accuracy: 90,
		basePower: 30,
		category: "Physical",
		name: "Pin Missile",
		desc: "High critical hit ratio",
		shortDesc:  "High critical hit ratio",
		pp: 15,
		priority: 0,
		critRatio: 2,
		secondary: null,
		target: "normal",
		type: "Bug",
	},
	petaldance: {
		inherit: true,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Petal Dance",
		desc: "No additional effect",
		shortDesc:  "No additional effect",
		pp: 10,
		priority: 0,
		secondary: null,
		target: "normal",
		type: "Grass",
	},
	willowisp: {
		inherit: true,
		gen: 1,
		accuracy: 85,
		category: "Status",
		name: "Will-O-Wisp",
		pp: 20,
		priority: 0,
		status: 'brn',
		secondary: null,
		target: "normal",
		type: "Fire",
	},
	quickattack: {
		inherit: true,
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		name: "Quick Attack",
		pp: 20,
		priority: 1,
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	megadrain: {
		inherit: true,
		basePower: 65,
		drain: [1, 2],
	},
	eggbomb: {
		inherit: true,
		basePower: 110,
		recoil: [33,100],
	},
	solarbeam: {
		inherit: true,
		basePower: 200,
	},
	teleport: {
		num: 100,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Teleport",
		pp: 20,
		priority: -6,
		flags: {metronome: 1, heal: 1},
		heal: [1,3],
		selfSwitch: true,
		secondary: null,
		target: "self",
		type: "Psychic",
		zMove: {effect: 'heal'},
		contestType: "Cool",
	},
	futuresight: {
		num: 248,
		gen: 1,
		accuracy: 100,
		basePower: 150,
		category: "Special",
		name: "Future Sight",
		pp: 10,
		priority: 0,
		flags: {allyanim: 1, metronome: 1, futuremove: 1},
		ignoreImmunity: true,
		onTry(source, target) {
			if (!target.side.addSlotCondition(target, 'futuremove')) return false;
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				duration: 3,
				move: 'futuresight',
				source: source,
				moveData: {
					id: 'futuresight',
					name: "Future Sight",
					accuracy: 100,
					basePower: 150,
					category: "Special",
					priority: 0,
					flags: {allyanim: 1, metronome: 1, futuremove: 1},
					ignoreImmunity: false,
					effectType: 'Move',
					type: 'Psychic',
				},
			});
			this.add('-start', source, 'move: Future Sight');
			return this.NOT_FAIL;
		},
		secondary: null,
		target: "normal",
		type: "Psychic",
		contestType: "Clever",
	},
	healingmist: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Healing Mist",
		pp: 10,
		priority: 0,
		flags: {heal: 1, bypasssub: 1, allyanim: 1},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Mist", target);
		},
		onHit(pokemon) {
			const success = !!this.heal(this.modify(pokemon.maxhp, 0.25));
			return pokemon.cureStatus() || success;
		},
		secondary: null,
		target: "allies",
		type: "Ice",
	},
	outrage: {
		gen: 1,
		accuracy: 90,
		basePower: 130,
		name: "Outrage",
		category: "Physical",
		desc: "1/10 chance to burn",
		shortDesc:  "1/10 chance to burn",
		pp: 10,
		priority: 0,
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Outrage", target);
		},
		secondary: {
			chance: 10,
			status: 'brn',
		},
		target: "normal",
		type: "Normal",
	},
	dragonrage: {
		num: 82,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Dragon Rage",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Dragon') return 1;
		},
		secondary: null,
		target: "normal",
		type: "???",
		contestType: "Cool",
	},
	dragonbreath: {
		num: 225,
		gen: 1,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Dragon Breath",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		secondary: {
			chance: 30,
			status: 'par',
		},
		target: "normal",
		type: "Dragon",
		contestType: "Cool",
	},
	guillotine: {
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		name: "Guillotine",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, punch: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1},
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('guillotine');
		},
		beforeMoveCallback(pokemon) {
			if (pokemon.volatiles['guillotine']?.lostFocus) {
				this.add('cant', pokemon, 'Guillotine', 'Guillotine');
				return true;
			}
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'move: Guillotine');
			},
			onHit(pokemon, source, move) {
				if (move.category !== 'Status') {
					this.effectState.lostFocus = true;
				}
			},
			onTryAddVolatile(status, pokemon) {
				if (status.id === 'flinch') return null;
			},
		},
		secondary: null,
		target: "normal",
		type: "Bug",
		contestType: "Tough",
	},
	wrap: {
		inherit: true,
		basePower: 60,
		pp: 10,
		overrideDefensiveStat: 'spe',
	},
	bind: {
		inherit: true,
		basePower: 60,
		accuracy: 85,
		pp: 5,
		overrideDefensiveStat: 'spe',
		type: "Rock",
	},
	clamp: {
		inherit: true,
		basePower: 60,
		accuracy: 85,
		pp: 5,
		overrideDefensiveStat: 'spe',
	},
	firespin: {
		inherit: true,
		basePower: 60,
		accuracy: 85,
		pp: 5,
		overrideDefensiveStat: 'spe',
	},
	magnetpull: {
		basePower: 60,
		accuracy: 85,
		category: "Special",
		name: "Magnet Pull",
		pp: 5,
		overrideDefensiveStat: 'spe',
		priority: 0,
		flags: {protect: 1, mirror: 1},
		volatileStatus: 'partiallytrapped',
		self: {
			volatileStatus: 'partialtrappinglock',
		},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Thunder Cage", target);
		},
		// FIXME: onBeforeMove(pokemon, target) {target.removeVolatile('mustrecharge')}
		onHit(target, source) {
			/**
			 * The duration of the partially trapped must be always renewed to 2
			 * so target doesn't move on trapper switch out as happens in gen 1.
			 * However, this won't happen if there's no switch and the trapper is
			 * about to end its partial trapping.
			 **/
			if (target.volatiles['partiallytrapped']) {
				if (source.volatiles['partialtrappinglock'] && source.volatiles['partialtrappinglock'].duration > 1) {
					target.volatiles['partiallytrapped'].duration = 2;
				}
			}
		},
		secondary: null,
		target: "normal",
		type: "Electric",
	},
}
