/**
 * A lot of Gen 1 moves have to be updated due to different mechanics.
 * Some moves have had major changes, such as Bite's typing.
 */

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	acid: {
		inherit: true,
		basePower: 80,
		secondary: {
			chance: 33,
			boosts: {
				def: -1,
			},
		},
		target: "normal",
	},
	amnesia: {
		inherit: true,
		boosts: {
			spa: 2,
			spd: 2,
		},
	},
	aurorabeam: {
		inherit: true,
		basePower: 100,
		secondary: {
			chance: 33,
			boosts: {
				atk: -1,
			},
		},
	},
	bide: {
		inherit: true,
		priority: 0,
		accuracy: true,
		condition: {
			onStart(pokemon) {
				this.effectState.damage = 0;
				this.effectState.time = this.random(2, 4);
				this.add('-start', pokemon, 'Bide');
			},
			onBeforeMove(pokemon, t, move) {
				const currentMove = this.dex.getActiveMove('bide');
				this.effectState.damage += this.lastDamage;
				this.effectState.time--;
				if (!this.effectState.time) {
					this.add('-end', pokemon, currentMove);
					if (!this.effectState.damage) {
						this.debug("Bide failed because no damage was stored");
						this.add('-fail', pokemon);
						pokemon.removeVolatile('bide');
						return false;
					}
					const target = this.getRandomTarget(pokemon, 'Pound');
					this.actions.moveHit(target, pokemon, currentMove, {damage: this.effectState.damage * 2} as ActiveMove);
					pokemon.removeVolatile('bide');
					return false;
				}
				this.add('-activate', pokemon, 'Bide');
				return false;
			},
			onDisableMove(pokemon) {
				if (!pokemon.hasMove('bide')) {
					return;
				}
				for (const moveSlot of pokemon.moveSlots) {
					if (moveSlot.id !== 'bide') {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
		},
		type: "???", // Will look as Normal but it's STAB-less
	},
	bind: {
		inherit: true,
		basePower: 45,
		accuracy: 85,
		desc: "The user is locked into using this move over two turns, during which the target is prevented from making any attacks. Both may switch out. Deals damage to the target based on its Speed.",
		shortDesc: "Target defends with Spe and cannot move for 2 turns",
		overrideDefensiveStat: 'spe',
		pp: 5,
		onModifyPriority(priority, source, target, move) {
			if (source.lastMove?.id === 'bind') {
				return priority -1;
			}
		},
		volatileStatus: 'partiallytrapped',
		self: {
			volatileStatus: 'partialtrappinglock',
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
		type: "Rock",
	},
	bite: {
		inherit: true,
		category: "Physical",
		secondary: {
			chance: 10,
			volatileStatus: 'flinch',
		},
		type: "Normal",
	},
	blizzard: {
		inherit: true,
		accuracy: 90,
		secondary: {
			chance: 30,
			status: 'frz',
		},
		target: "normal",
	},
	bubble: {
		inherit: true,
		secondary: {
			chance: 33,
			boosts: {
				spe: -1,
			},
		},
		target: "normal",
	},
	bubblebeam: {
		inherit: true,
		secondary: {
			chance: 33,
			boosts: {
				spe: -1,
			},
		},
	},
	clamp: {
		inherit: true,
		basePower: 45,
		accuracy: 85,
		desc: "The user is locked into using this move over two turns, during which the target is prevented from making any attacks. Both may switch out. Deals damage to the target based on its Speed.",
		shortDesc: "Target defends with Spe and cannot move for 2 turns",
		overrideDefensiveStat: 'spe',
		pp: 5,
		onModifyPriority(priority, source, target, move) {
			if (source.lastMove?.id === 'clamp') {
				return priority -1;
			}
		},
		volatileStatus: 'partiallytrapped',
		self: {
			volatileStatus: 'partialtrappinglock',
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
	},
	constrict: {
		inherit: true,
		secondary: {
			chance: 33,
			boosts: {
				spe: -1,
			},
		},
	},
	conversion: {
		inherit: true,
		heal: [1, 2],
		target: "normal",
		onHit(target, source) {
			source.setType(target.getTypes(true));
			this.add('-start', source, 'typechange', source.types.join('/'), '[from] move: Conversion', '[of] ' + target);
		},
	},
	counter: {
		inherit: true,
		ignoreImmunity: true,
		willCrit: false,
		basePower: 1,
		damageCallback(pokemon, target) {
			// Counter mechanics in gen 1:
			// - a move is Counterable if it is Normal or Fighting type, has nonzero Base Power, and is not Counter
			// - if Counter is used by the player, it will succeed if the opponent's last used move is Counterable
			// - if Counter is used by the opponent, it will succeed if the player's last selected move is Counterable
			// - (Counter will thus desync if the target's last used move is not as counterable as the target's last selected move)
			// - if Counter succeeds it will deal twice the last move damage dealt in battle (even if it's from a different pokemon because of a switch)

			const lastMove = target.side.lastMove && this.dex.moves.get(target.side.lastMove.id);
			const lastMoveIsCounterable = lastMove && lastMove.basePower > 0 &&
				['Normal', 'Fighting'].includes(lastMove.type) && lastMove.id !== 'counter';

			const lastSelectedMove = target.side.lastSelectedMove && this.dex.moves.get(target.side.lastSelectedMove);
			const lastSelectedMoveIsCounterable = lastSelectedMove && lastSelectedMove.basePower > 0 &&
				['Normal', 'Fighting'].includes(lastSelectedMove.type) && lastSelectedMove.id !== 'counter';

			if (!lastMoveIsCounterable && !lastSelectedMoveIsCounterable) {
				this.debug("Gen 1 Counter: last move was not Counterable");
				this.add('-fail', pokemon);
				return false;
			}
			if (this.lastDamage <= 0) {
				this.debug("Gen 1 Counter: no previous damage exists");
				this.add('-fail', pokemon);
				return false;
			}
			if (!lastMoveIsCounterable || !lastSelectedMoveIsCounterable) {
				this.hint("Desync Clause Mod activated!");
				this.add('-fail', pokemon);
				return false;
			}

			return 2 * this.lastDamage;
		},
		flags: {contact: 1, protect: 1, metronome: 1},
	},
	crabhammer: {
		inherit: true,
		critRatio: 2,
	},
	dig: {
		inherit: true,
		basePower: 100,
		condition: {},
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile('twoturnmove')) {
				attacker.removeVolatile('invulnerability');
				return;
			}
			this.add('-prepare', attacker, move.name);
			attacker.addVolatile('twoturnmove', defender);
			attacker.addVolatile('invulnerability', defender);
			return null;
		},
	},
	disable: {
		num: 50,
		accuracy: 55,
		basePower: 0,
		category: "Status",
		name: "Disable",
		pp: 20,
		priority: 0,
		flags: {protect: 1, mirror: 1, bypasssub: 1, metronome: 1},
		volatileStatus: 'disable',
		onTryHit(target) {
			// This function should not return if the checks are met. Adding && undefined ensures this happens.
			return target.moveSlots.some(ms => ms.pp > 0) &&
				!('disable' in target.volatiles) &&
				undefined;
		},
		condition: {
			onStart(pokemon) {
				// disable can only select moves that have pp > 0, hence the onTryHit modification
				const moveSlot = this.sample(pokemon.moveSlots.filter(ms => ms.pp > 0));
				this.add('-start', pokemon, 'Disable', moveSlot.move);
				this.effectState.move = moveSlot.id;
				// 1-8 turns (which will in effect translate to 0-7 missed turns for the target)
				this.effectState.time = this.random(1, 9);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Disable');
			},
			onBeforeMovePriority: 6,
			onBeforeMove(pokemon, target, move) {
				pokemon.volatiles['disable'].time--;
				if (!pokemon.volatiles['disable'].time) {
					pokemon.removeVolatile('disable');
					return;
				}
				if (pokemon.volatiles['bide']) move = this.dex.getActiveMove('bide');
				if (move.id === this.effectState.move) {
					this.add('cant', pokemon, 'Disable', move);
					pokemon.removeVolatile('twoturnmove');
					return false;
				}
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (moveSlot.id === this.effectState.move) {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	dizzypunch: {
		inherit: true,
		secondary: null,
	},
	doubleedge: {
		inherit: true,
		basePower: 110,
		recoil: [1, 4],
	},
	dragonbreath: {
		gen: 1,
		num: 225,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Dragon Breath",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		secondary: {
			chance: 30,
			status: 'par',
		},
		target: "normal",
		type: "Dragon",
	},
	dragonrage: {
		num: 82,
		accuracy: 100,
		basePower: 130,
		category: "Physical",
		name: "Dragon Rage",
		desc: "Has a 10% chance to burn the target.",
		shortDesc: "10% chance to burn.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
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
	dreameater: {
		num: 138,
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		name: "Dream Eater",
		desc: "The user recovers 1/2 the HP lost by the target, rounded down.",
		shortDesc: "User recovers 50% of the damage dealt.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, heal: 1, metronome: 1},
		drain: [1, 2],
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
	explosion: {
		inherit: true,
		basePower: 170,
		target: "normal",
	},
	eggbomb: {
		num: 121,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Egg Bomb",
		desc: "If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP. If this move breaks the target's substitute, the user does not take any recoil damage.",
		shortDesc: "Has 1/4 recoil.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		recoil: [1, 4],
		secondary: null,
		target: "normal",
		type: "Grass",
	},
	fireblast: {
		inherit: true,
		accuracy: 90,
		basePower: 125,
		secondary: {
			chance: 30,
			status: 'brn',
		},
	},
	firespin: {
		inherit: true,
		basePower: 45,
		accuracy: 85,
		desc: "The user is locked into using this move over two turns, during which the target is prevented from making any attacks. Both may switch out. Deals damage to the target based on its Speed.",
		shortDesc: "Target defends with Spe and cannot move for 2 turns",
		overrideDefensiveStat: 'spe',
		pp: 5,
		onModifyPriority(priority, source, target, move) {
			if (source.lastMove?.id === 'firespin') {
				return priority -1;
			}
		},
		volatileStatus: 'partiallytrapped',
		self: {
			volatileStatus: 'partialtrappinglock',
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
	},
	firepunch: {
		inherit: true,
		basePower: 85,
	},
	fissure: {
		num: 90,
		accuracy: 100,
		basePower: 65,
		basePowerCallback(pokemon, target, move) {
			if (target.getStat('spe') > pokemon.getStat('spe')) {
				return 0;
			}
			return 65;
		},
		category: "Physical",
		name: "Fissure",
		desc: "Fails if the target's Speed is greater than the user's, The user loses its focus and does nothing if it is hit by a damaging attack this turn before it can execute the move, but it still loses PP. High critcal hit ratio.",
		shortDesc: "Fails if target is faster or the user takes damage before it hits.",
		pp: 5,
		priority: 0,
		critRatio: 2,
		flags: {contact: 1, protect: 1, punch: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1},
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('fissure');
		},
		beforeMoveCallback(pokemon) {
			if (pokemon.volatiles['fissure']?.lostFocus) {
				this.add('cant', pokemon, 'fissure', 'fissure');
				return true;
			}
		},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, move.name, target);
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'move: Fissure');
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
		type: "Ground",
	},
	flamethrower: {
		num: 53,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Flamethrower",
		pp: 15,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		secondary: {
			chance: 10,
			status: 'brn',
		},
		target: "normal",
		type: "Fire",
	},
	fly: {
		inherit: true,
		condition: {},
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile('twoturnmove')) {
				attacker.removeVolatile('invulnerability');
				return;
			}
			this.add('-prepare', attacker, move.name);
			attacker.addVolatile('twoturnmove', defender);
			attacker.addVolatile('invulnerability', defender);
			return null;
		},
	},
	focusenergy: {
		inherit: true,
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'move: Focus Energy');
			},
			// This does nothing as it's dealt with on critical hit calculation.
			onModifyMove() {},
		},
	},
	futuresight: {
		gen: 1,
		num: 248,
		accuracy: 100,
		basePower: 150,
		category: "Special",
		name: "Future Sight",
		pp: 10,
		priority: 0,
		flags: {metronome: 1, futuremove: 1},
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
	},
	glare: {
		inherit: true,
		ignoreImmunity: true,
		accuracy: 85,
	},
	growth: {
		inherit: true,
		boosts: {
			spa: 1,
			spd: 1,
		},
	},
	guillotine: {
		accuracy: 100,
		basePower: 45,
		basePowerCallback(pokemon, target, move) {
			if (target.getStat('spe') > pokemon.getStat('spe')) {
				return 0;
			}
			return 45;
		},
		category: "Physical",
		name: "Guillotine",
		desc: "Fails if the target's Speed is greater than the user's, The user loses its focus and does nothing if it is hit by a damaging attack this turn before it can execute the move, but it still loses PP. High critcal hit ratio.",
		shortDesc: "Fails if target is faster or the user takes damage before it hits.",
		pp: 5,
		priority: 0,
		critRatio: 2,
		flags: {contact: 1, protect: 1, punch: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1},
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('guillotine');
		},
		beforeMoveCallback(pokemon) {
			if (pokemon.volatiles['guillotine']?.lostFocus) {
				this.add('cant', pokemon, 'guillotine', 'guillotine');
				return true;
			}
		},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, move.name, target);
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
	},
	haze: {
		inherit: true,
		onHit(target, source) {
			this.add('-activate', target, 'move: Haze');
			this.add('-clearallboost', '[silent]');
			for (const pokemon of this.getAllActive()) {
				pokemon.clearBoosts();
				if (pokemon !== source) {
					pokemon.cureStatus(true);
				}
				if (pokemon.status === 'tox') {
					pokemon.setStatus('psn', null, null, true);
				}
				pokemon.updateSpeed();
				// should only clear a specific set of volatiles
				// while technically the toxic counter shouldn't be cleared, the preserved toxic counter is never used again
				// in-game, so it is equivalent to just clear it.
				const silentHack = '|[silent]';
				const silentHackVolatiles = ['disable', 'confusion'];
				const hazeVolatiles: {[key: string]: string} = {
					'disable': '',
					'confusion': '',
					'mist': 'Mist',
					'focusenergy': 'move: Focus Energy',
					'leechseed': 'move: Leech Seed',
					'lightscreen': 'Light Screen',
					'reflect': 'Reflect',
					'residualdmg': 'Toxic counter',
				};
				for (const v in hazeVolatiles) {
					if (!pokemon.removeVolatile(v)) {
						continue;
					}
					if (silentHackVolatiles.includes(v)) {
						// these volatiles have their own onEnd method that prints, so to avoid
						// double printing and ensure they are still silent, we need to tack on a
						// silent attribute at the end
						this.log[this.log.length - 1] += silentHack;
					} else {
						this.add('-end', pokemon, hazeVolatiles[v], '[silent]');
					}
				}
			}
		},
		target: "self",
	},
	healingmist: {
		gen: 1,
		num: -1,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Healing Mist",
		desc: "Restores the HP of the user by 25%, cures non-volatile status conditions, and clears all boosts.",
		shortDesc: "User heals 1/4 max HP, cures status and clears boosts.",
		pp: 10,
		priority: 0,
		flags: {heal: 1},
		heal: null,
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Mist", target);
		},
		onHit(target) {
			target.cureStatus();
			target.clearBoosts();
			this.add('-clearboost', target);
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			this.heal(Math.floor(target.maxhp / 4), target, target);
		},
		secondary: null,
		target: "self",
		type: "Ice",
	},
	highjumpkick: {
		inherit: true,
		onMoveFail(target, source, move) {
			this.directDamage(1, source, target);
		},
	},
	horndrill: {
		accuracy: 100,
		basePower: 90,
		basePowerCallback(pokemon, target, move) {
			if (target.getStat('spe') > pokemon.getStat('spe')) {
				return 0;
			}
			return 90;
		},
		category: "Physical",
		name: "Horn Drill",
		desc: "Fails if the target's Speed is greater than the user's, The user loses its focus and does nothing if it is hit by a damaging attack this turn before it can execute the move, but it still loses PP. High critcal hit ratio.",
		shortDesc: "Fails if target is faster or the user takes damage before it hits.",
		pp: 5,
		priority: 0,
		critRatio: 2,
		flags: {contact: 1, protect: 1, punch: 1, failmefirst: 1, nosleeptalk: 1, noassist: 1, failcopycat: 1, failinstruct: 1},
		priorityChargeCallback(pokemon) {
			pokemon.addVolatile('horndrill');
		},
		beforeMoveCallback(pokemon) {
			if (pokemon.volatiles['horndrill']?.lostFocus) {
				this.add('cant', pokemon, 'horndrill', 'horndrill');
				return true;
			}
		},
		onTryHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, move.name, target);
		},
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add('-singleturn', pokemon, 'move: Horn Drill');
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
		type: "Normal",
	},
	hurricane: {
		gen: 1,
		num: 542,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Hurricane",
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 5,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		secondary: null,
		target: "normal",
		type: "Flying",
	},
	hydropump: {
		num: 56,
		accuracy: 90,
		basePower: 120,
		category: "Special",
		name: "Hydro Pump",
		pp: 5,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		target: "normal",
		type: "Water",
	},
	hypnosis: {
		num: 95,
		accuracy: 70,
    	basePower: 0,
		category: "Status",
		name: "Hypnosis",
		desc: "Causes the target to fall asleep for 3-5 turns.",
		shortDesc: "Target falls asleep for 3-5 turns",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		status: 'slp',
		onHit(target, source, move) {
			this.effectState.startTime = this.random(3, 6);
			this.effectState.time = this.effectState.startTime;
		},	
		secondary: null,
		target: "normal",
		type: "Psychic",
	},
	jumpkick: {
		inherit: true,
		onMoveFail(target, source, move) {
			this.directDamage(1, source, target);
		},
	},
	karatechop: {
		inherit: true,
		critRatio: 2,
		type: "Normal",
	},
	kinesis: {
		num: 134,
		accuracy: 100,
		basePower: 0,
		category: "Status",
		name: "Kinesis",
		desc: "Lowers the target's attack by 2 stages.",
		shortDesc: "Lowers the target's accuracy by 1.",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		boosts: {
			atk: -2,
		},
		secondary: null,
		target: "normal",
		type: "Psychic",
	},
	leechseed: {
		inherit: true,
		onHit() {},
		condition: {
			onStart(target) {
				this.add('-start', target, 'move: Leech Seed');
			},
			onAfterMoveSelfPriority: 1,
			onAfterMoveSelf(pokemon) {
				const leecher = this.getAtSlot(pokemon.volatiles['leechseed'].sourceSlot);
				if (!leecher || leecher.fainted || leecher.hp <= 0) {
					this.debug('Nothing to leech into');
					return;
				}
				// We check if leeched Pokémon has Toxic to increase leeched damage.
				let toxicCounter = 1;
				const residualdmg = pokemon.volatiles['residualdmg'];
				if (residualdmg) {
					residualdmg.counter++;
					toxicCounter = residualdmg.counter;
				}
				const toLeech = this.clampIntRange(Math.floor(pokemon.baseMaxhp / 16), 1) * toxicCounter;
				const damage = this.damage(toLeech, pokemon, leecher);
				if (residualdmg) this.hint("In Gen 1, Leech Seed's damage is affected by Toxic's counter.", true);
				if (!damage || toLeech > damage) {
					this.hint("In Gen 1, Leech Seed recovery is not limited by the remaining HP of the seeded Pokemon.", true);
				}
				this.heal(toLeech, leecher, pokemon);
			},
		},
	},
	lightscreen: {
		num: 113,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Light Screen",
		pp: 30,
		priority: 0,
		flags: {metronome: 1},
		volatileStatus: 'lightscreen',
		onTryHit(pokemon) {
			if (pokemon.volatiles['lightscreen']) {
				return false;
			}
		},
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'Light Screen');
			},
		},
		target: "self",
		type: "Psychic",
	},
	lovelykiss: {
		num: 142,
		accuracy: 75,
    	basePower: 0,
		category: "Status",
		name: "Lovely Kiss",
		desc: "Causes the target to fall asleep for 4-6 turns.",
		shortDesc: "Target falls asleep for 4-6 turns.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		status: 'slp',
		onHit(target, source, move) {
			this.effectState.startTime = this.random(4, 7);
			this.effectState.time = this.effectState.startTime;
		},	
		secondary: null,
		target: "normal",
		type: "Ice",
	},
	magnetise: {
		gen: 1,
		num: -2,
		basePower: 45,
		accuracy: 85,
		category: "Special",
		name: "Magnetise",
		desc: "The user is locked into using this move over two turns, during which the target is prevented from making any attacks. Both may switch out. Deals damage to the target based on its Speed.",
		shortDesc: "Target defends with Spe and cannot move for 2 turns.",
		overrideDefensiveStat: 'spe',
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onModifyPriority(priority, source, target, move) {
			if (source.lastMove?.id === 'magnetise') {
				return priority -1;
			}
		},
		volatileStatus: 'partiallytrapped',
		self: {
			volatileStatus: 'partialtrappinglock',
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
	megadrain: {
		num: 72,
		accuracy: 100,
		basePower: 65,
		category: "Special",
		name: "Mega Drain",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, heal: 1, metronome: 1},
		drain: [1, 2],
		secondary: null,
		target: "normal",
		type: "Grass",
	},
	mimic: {
		inherit: true,
		flags: {protect: 1, bypasssub: 1, metronome: 1},
		onHit(target, source) {
			const moveslot = source.moves.indexOf('mimic');
			if (moveslot < 0) return false;
			const moves = target.moves;
			const moveid = this.sample(moves);
			if (!moveid) return false;
			const move = this.dex.moves.get(moveid);
			source.moveSlots[moveslot] = {
				move: move.name,
				id: move.id,
				pp: source.moveSlots[moveslot].pp,
				maxpp: move.pp * 8 / 5,
				target: move.target,
				disabled: false,
				used: false,
				virtual: true,
			};
			this.add('-start', source, 'Mimic', move.name);
		},
	},
	mirrormove: {
		inherit: true,
		onHit(pokemon) {
			const foe = pokemon.side.foe.active[0];
			if (!foe?.lastMove || foe.lastMove.id === 'mirrormove') {
				return false;
			}
			pokemon.side.lastSelectedMove = foe.lastMove.id;
			this.actions.useMove(foe.lastMove.id, pokemon);
		},
	},
	mist: {
		inherit: true,
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'Mist');
			},
			onTryBoost(boost, target, source, effect) {
				if (effect.effectType === 'Move' && effect.category !== 'Status') return;
				if (source && target !== source) {
					let showMsg = false;
					let i: BoostID;
					for (i in boost) {
						if (boost[i]! < 0) {
							delete boost[i];
							showMsg = true;
						}
					}
					if (showMsg && !(effect as ActiveMove).secondaries) {
						this.add('-activate', target, 'move: Mist');
					}
				}
			},
		},
	},
	nightshade: {
		inherit: true,
		ignoreImmunity: true,
		basePower: 1,
	},
	petaldance: {
		inherit: true,
		onMoveFail() {},
	},
	pinmissile: {
		num: 42,
		accuracy: 90,
		basePower: 30,
		category: "Physical",
		name: "Pin Missile",
		desc: "High crit ratio.",
		shortDesc: "High crit ratio.",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		critRatio: 2,
		secondary: null,
		target: "normal",
		type: "Bug",
	},
	poisonsting: {
		inherit: true,
		secondary: {
			chance: 20,
			status: 'psn',
		},
	},
	psychic: {
		inherit: true,
		secondary: {
			chance: 33,
			boosts: {
				spa: -1,
				spd: -1,
			},
		},
	},
	psywave: {
		inherit: true,
		basePower: 1,
		damageCallback(pokemon) {
			const psywaveDamage = (this.random(0, this.trunc(1.5 * pokemon.level)));
			if (psywaveDamage <= 0) {
				this.hint("Desync Clause Mod activated!");
				return false;
			}
			return psywaveDamage;
		},
	},
	quickattack: {
		num: 98,
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		name: "Quick Attack",
		pp: 20,
		priority: 1,
		flags: {mirror: 1, metronome: 1},
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	rage: {
		inherit: true,
		self: {
			volatileStatus: 'rage',
		},
		condition: {
			// Rage lock
			onStart(target, source, effect) {
				this.effectState.move = 'rage';
				this.effectState.accuracy = 255;
			},
			onLockMove: 'rage',
			onHit(target, source, move) {
				// Disable and exploding moves boost Rage even if they miss/fail, so they are dealt with separately.
				if (target.boosts.atk < 6 && (move.category !== 'Status' && !move.selfdestruct)) {
					this.boost({atk: 1});
				}
			},
		},
	},
	razorleaf: {
		inherit: true,
		critRatio: 2,
		target: "normal",
	},
	razorwind: {
		inherit: true,
		critRatio: 1,
		target: "normal",
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile('twoturnmove')) {
				attacker.removeVolatile('invulnerability');
				return;
			}
			this.add('-prepare', attacker, move.name);
			attacker.addVolatile('twoturnmove', defender);
			return null;
		},
	},
	recover: {
		inherit: true,
		heal: null,
		onHit(target) {
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			this.heal(Math.floor(target.maxhp / 2), target, target);
		},
	},
	reflect: {
		num: 115,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Reflect",
		pp: 20,
		priority: 0,
		flags: {metronome: 1},
		volatileStatus: 'reflect',
		onTryHit(pokemon) {
			if (pokemon.volatiles['reflect']) {
				return false;
			}
		},
		condition: {
			onStart(pokemon) {
				this.add('-start', pokemon, 'Reflect');
			},
		},
		secondary: null,
		target: "self",
		type: "Psychic",
	},
	rest: {
		inherit: true,
		onTry() {},
		onHit(target, source, move) {
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			if (!target.setStatus('slp', source, move)) return false;
			target.statusState.time = 2;
			target.statusState.startTime = 2;
			this.heal(target.maxhp); // Aesthetic only as the healing happens after you fall asleep in-game
		},
	},
	rockslide: {
		inherit: true,
		basePower: 85,
		accuracy: 100,
		secondary: null,
		target: "normal",
	},
	rockthrow: {
		inherit: true,
		accuracy: 100,
	},
	rollout: {
		gen: 1,
		num: 205,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Rollout",
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		secondary: null,
		target: "normal",
		type: "Rock",
	},
	roost: {
		inherit: true,
		gen: 1,
	}
	sandattack: {
		inherit: true,
		ignoreImmunity: false,
		accuracy: 85,
		boosts: {
			spa: -1,
			spd: -1,
		},
		type: "Ground",
	},
	seismictoss: {
		inherit: true,
		ignoreImmunity: true,
		basePower: 1,
	},
	selfdestruct: {
		inherit: true,
		basePower: 130,
		target: "normal",
	},
	sing: {
		num: 47,
		accuracy: 65,
    	basePower: 0,
		category: "Status",
		name: "Sing",
		desc: "Causes the target to fall asleep for 2-4 turns.",
		shortDesc: "Target falls asleep for 2-4 turns.",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		status: 'slp',
		onHit(target, source, move) {
			this.effectState.startTime = this.random(2, 5);
			this.effectState.time = this.effectState.startTime;
		},	
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	skullbash: {
		inherit: true,
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile('twoturnmove')) {
				attacker.removeVolatile('invulnerability');
				return;
			}
			this.add('-prepare', attacker, move.name);
			attacker.addVolatile('twoturnmove', defender);
			return null;
		},
	},
	skyattack: {
		num: 143,
		accuracy: 100,
		basePower: 45,
		category: "Physical",
		name: "Sky Attack",
		desc: "High crit ratio.",
		shortDesc: "High crit ratio.",
		pp: 10,
		priority: 0,
		critRatio: 2,
		flags: {mirror: 1, metronome: 1},
		secondary: null,
		target: "normal",
		type: "Flying",
	},
	slash: {
		inherit: true,
		critRatio: 2,
	},
	sludge: {
		inherit: true,
		basePower: 90,
		secondary: {
			chance: 40,
			status: 'psn',
		},
	},
	solarbeam: {
		num: 76,
		accuracy: 100,
		basePower: 100,
		basePowerCallback(pokemon, target, move) {
			if (pokemon.lastMove?.id === 'synthesis') {
				return 150;
			}
			return 100;
		},
		category: "Special",
		name: "Solar Beam",
		desc: "Has a base power of 150 if synthesis was the last move used by this pokemon.",
		shortDesc: "Increased power after using synthesis.",
		pp: 10,
		priority: 0,
		flags: {metronome: 1},
		secondary: null,
		target: "normal",
		type: "Grass",
	},
	sonicboom: {
		num: 49,
		accuracy: 100,
		basePower: 200,
		category: "Physical",
		name: "Sonic Boom",
		pp: 8,
		desc: "If the target lost HP, the user takes recoil damage equal to 1/2 the HP lost by the target, rounded down, but not less than 1 HP. If this move breaks the target's substitute, the user does not take any recoil damage.",
		shortDesc: "Has 1/2 recoil.",
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		recoil: [1,2],
		secondary: null,
		target: "normal",
		type: "Normal",
	},
	softboiled: {
		inherit: true,
		heal: null,
		onHit(target) {
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			this.heal(Math.floor(target.maxhp / 2), target, target);
		},
	},
	spore: {
		num: 147,
		accuracy: 100,
    	basePower: 0,
		category: "Status",
		name: "Spore",
		desc: "Causes the target to fall asleep for 4-6 turns.",
		shortDesc: "Target falls asleep for 4-6 turns.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		status: 'slp',
		onHit(target, source, move) {
			this.effectState.startTime = this.random(4, 7);
			this.effectState.time = this.effectState.startTime;
		},	
		secondary: null,
		target: "normal",
		type: "Grass",
	},
	stomp: {
		num: 23,
		accuracy: 100,
		basePower: 75,
		category: "Physical",
		name: "Stomp",
		desc: "Has a 33% chance to lower the target's speed by 1 stage.",
		shortDesc: "33% chance to lower spe by 1.",
		pp: 20,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		secondary: {
			chance: 33,
			boosts: {
				spe: -1,
			}
		},
		target: "normal",
		type: "Normal",
	},
	struggle: {
		inherit: true,
		pp: 10,
		recoil: [1, 2],
		onModifyMove() {},
	},
	substitute: {
		num: 164,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Substitute",
		pp: 10,
		priority: 0,
		flags: {metronome: 1},
		volatileStatus: 'substitute',
		onTryHit(target) {
			if (target.volatiles['substitute']) {
				this.add('-fail', target, 'move: Substitute');
				return null;
			}
			// We only prevent when hp is less than one quarter.
			// If you use substitute at exactly one quarter, you faint.
			if (target.hp < target.maxhp / 4) {
				this.add('-fail', target, 'move: Substitute', '[weak]');
				return null;
			}
		},
		onHit(target) {
			// If max HP is 3 or less substitute makes no damage
			if (target.maxhp > 3) {
				this.directDamage(target.maxhp / 4, target, target);
			}
		},
		condition: {
			onStart(target) {
				this.add('-start', target, 'Substitute');
				this.effectState.hp = Math.floor(target.maxhp / 4) + 1;
				delete target.volatiles['partiallytrapped'];
			},
			onTryHitPriority: -1,
			onTryHit(target, source, move) {
				if (move.category === 'Status') {
					// In gen 1 it only blocks:
					// poison, confusion, secondary effect confusion, stat reducing moves and Leech Seed.
					const SubBlocked = ['lockon', 'meanlook', 'mindreader', 'nightmare'];
					if (
						move.status === 'psn' || move.status === 'tox' || (move.boosts && target !== source) ||
						move.volatileStatus === 'confusion' || SubBlocked.includes(move.id)
					) {
						return false;
					}
					return;
				}
				if (move.volatileStatus && target === source) return;
				// NOTE: In future generations the damage is capped to the remaining HP of the
				// Substitute, here we deliberately use the uncapped damage when tracking lastDamage etc.
				// Also, multi-hit moves must always deal the same damage as the first hit for any subsequent hits
				let uncappedDamage = move.hit > 1 ? this.lastDamage : this.actions.getDamage(source, target, move);
				if (move.id === 'bide') uncappedDamage = source.volatiles['bide'].damage * 2;
				if (!uncappedDamage && uncappedDamage !== 0) return null;
				uncappedDamage = this.runEvent('SubDamage', target, source, move, uncappedDamage);
				if (!uncappedDamage && uncappedDamage !== 0) return uncappedDamage;
				this.lastDamage = uncappedDamage;
				target.volatiles['substitute'].hp -= uncappedDamage > target.volatiles['substitute'].hp ?
					target.volatiles['substitute'].hp : uncappedDamage;
				if (target.volatiles['substitute'].hp <= 0) {
					target.removeVolatile('substitute');
					target.subFainted = true;
				} else {
					this.add('-activate', target, 'Substitute', '[damage]');
				}
				// Drain/recoil/secondary effect confusion do not happen if the substitute breaks
				if (target.volatiles['substitute']) {
					if (move.recoil) {
						this.damage(this.clampIntRange(Math.floor(uncappedDamage * move.recoil[0] / move.recoil[1]), 1)
							, source, target, 'recoil');
					}
					if (move.drain) {
						const amount = this.clampIntRange(Math.floor(uncappedDamage * move.drain[0] / move.drain[1]), 1);
						this.lastDamage = amount;
						this.heal(amount, source, target, 'drain');
					}
					if (move.secondary?.volatileStatus === 'confusion') {
						const secondary = move.secondary;
						if (secondary.chance === undefined || this.randomChance(Math.ceil(secondary.chance * 256 / 100) - 1, 256)) {
							target.addVolatile(move.secondary.volatileStatus, source, move);
							this.hint(
								"In Gen 1, moves that inflict confusion as a secondary effect can confuse targets with a Substitute, " +
								"as long as the move does not break the Substitute."
							);
						}
					}
				}
				this.runEvent('AfterSubDamage', target, source, move, uncappedDamage);
				// Add here counter damage
				const lastAttackedBy = target.getLastAttackedBy();
				if (!lastAttackedBy) {
					target.attackedBy.push({source: source, move: move.id, damage: uncappedDamage, slot: source.getSlot(), thisTurn: true});
				} else {
					lastAttackedBy.move = move.id;
					lastAttackedBy.damage = uncappedDamage;
				}
				return 0;
			},
			onEnd(target) {
				this.add('-end', target, 'Substitute');
			},
		},
		secondary: null,
		target: "self",
		type: "Normal",
	},
	superfang: {
		inherit: true,
		ignoreImmunity: true,
		basePower: 1,
	},
	synthesis: {
		gen: 1,
		num: 235,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Synthesis",
		pp: 5,
		priority: 0,
		flags: {heal: 1, metronome: 1},
		heal: null,
		onHit(target) {
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			this.heal(Math.floor(target.maxhp / 2), target, target);
		},
		secondary: null,
		target: "self",
		type: "Grass",
	},
	teleport: {
		num: 100,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Teleport",
		desc: "If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members. The user restores 1/3 of its maximum HP, rounded half up.",
		shortDesc: "User switches out and heals the user by 1/3 of its max HP.",
		pp: 20,
		priority: -6,
		flags: {metronome: 1, heal: 1},
		onTry(source) {
			return !!this.canSwitch(source.side);
		},
		selfSwitch: true,
		heal: null,
		onHit(target) {
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			this.heal(Math.floor(target.maxhp / 3), target, target);
		},
		secondary: null,
		target: "self",
		type: "Psychic",
	},
	thrash: {
		inherit: true,
		onMoveFail() {},
	},
	thunder: {
		inherit: true,
		accuracy: 85,
		pp: 5,
		secondary: {
			chance: 30,
			status: 'par',
		},
	},
	whirlpool: {
		gen: 1,
		num: 250,
		accuracy: 100,
		basePower: 90,
		category: "Special",
		name: "Whirlpool",
		desc: "Has a 33% chance to lower the target's Speed by 1 stage.",
		shortDesc: "33% chance to lower target's Speed by 1.",
		pp: 20,
		priority: 0,
		flags: { mirror: 1, metronome: 1},
		secondary: {
			chance: 33,
			boosts: {
				spe: -1,
			},
		},
		target: "normal",
		type: "Water",
	},
	willowisp: {
		gen: 1,
		num: 261,
		accuracy: 85,
		basePower: 0,
		category: "Status",
		name: "Will-O-Wisp",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		status: 'brn',
		secondary: null,
		target: "normal",
		type: "Ghost",
	},
	// withdraw: {
	// 	num: 110,
	// 	accuracy: true,
	// 	basePower: 0,
	// 	name: "Withdraw",
	// 	desc: "The user falls asleep for the next two turns and restores all of its HP, curing itself of any non-volatile status condition in the process. This does not remove the user's stat penalty for burn or paralysis. While the user rests, its Special and Defence is doubled when taking damage. Fails if the user has full HP.",
	// 	shortDesc: "User doubles defences and sleeps for 2 turns and restores HP and status.",
	// 	category: "Status",
	// 	pp: 10,
	// 	priority: 0,
	// 	volatileStatus: 'withdraw',
	// 	flags: {heal: 1, metronome: 1},
	// 	onTry(source) {
	// 		if (source.status === 'slp') return false;

	// 		if (source.hp === source.maxhp) {
	// 			this.add('-fail', source, 'heal');
	// 			return null;
	// 		}
	// 	},
	// 	onHit(target, source, move) {
	// 		const result = target.setStatus('slp', source, move);
	// 		if (!result) return result;
	// 		target.statusState.time = 2;
	// 		target.statusState.startTime = 2;
	// 		this.heal(target.maxhp); // Aesthetic only as the healing happens after you fall asleep in-game
	// 	},
	// 	condition: {
	// 		duration: 2,
	// 		onStart(pokemon) {
	// 			this.add('-start', pokemon, 'Withdraw');
	// 		},
	// 	},
	// 	boosts: {},
	// 	secondary: null,
	// 	target: "self",
	// 	type: "Water",
	// },
	// withdraw: {
	// 	inherit: 'rest',
	// 	num: -1,
	// 	name: "withdraw",
	// 	pp: 20,
	// 	volatileStatus: 'withdraw',
	// 	onTry() {},
	// 	onHit(target, source, move) {
	// 		if (target.hp === target.maxhp) return false;
	// 		// Fail when health is 255 or 511 less than max, unless it is divisible by 256
	// 		if (
	// 			target.hp === target.maxhp ||
	// 			((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
	// 		) {
	// 			this.hint(
	// 				"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
	// 				"unless the current hp is also divisible by 256."
	// 			);
	// 			return false;
	// 		}
	// 		if (!target.setStatus('slp', source, move)) return false;
	// 		target.statusState.time = 2;
	// 		target.statusState.startTime = 2;
	// 		this.heal(target.maxhp); // Aesthetic only as the healing happens after you fall asleep in-game
	// 	},
	// 	condition: {
	// 		duration: 2,
	// 		onStart(pokemon) {
	// 			this.add('-start', pokemon, 'Withdraw');
	// 		},
	// 	},
	// 	secondary: {
	// 		chance: 100,
	// 		boosts: {
	// 			def: -1,
	// 		},
	// 	},
	// 	type: "Water",
	// },
	regenerate: {
		inherit: 'rest',
		num: -1,
		name: "Regenerate",
		pp: 5,
		onTry() {},
		onHit(target, source, move) {
			if (target.hp === target.maxhp) return false;
			// Fail when health is 255 or 511 less than max, unless it is divisible by 256
			if (
				target.hp === target.maxhp ||
				((target.hp === (target.maxhp - 255) || target.hp === (target.maxhp - 511)) && target.hp % 256 !== 0)
			) {
				this.hint(
					"In Gen 1, recovery moves fail if (user's maximum HP - user's current HP + 1) is divisible by 256, " +
					"unless the current hp is also divisible by 256."
				);
				return false;
			}
			if (!target.setStatus('slp', source, move)) return false;
			target.statusState.time = 1;
			target.statusState.startTime = 1;
			this.heal(target.maxhp); // Aesthetic only as the healing happens after you fall asleep in-game
		},
		type: "Water",
	},
	wingattack: {
		inherit: true,
		basePower: 35,
	},
	wrap: {
		inherit: true,
		basePower: 45,
		accuracy: 85,
		desc: "The user is locked into using this move over two turns, during which the target is prevented from making any attacks. Both may switch out. Deals damage to the target based on its Speed.",
		shortDesc: "Target defends with Spe and cannot move for 2 turns",
		overrideDefensiveStat: 'spe',
		pp: 10,
		onModifyPriority(priority, source, target, move) {
			if (source.lastMove?.id === 'wrap') {
				return priority -1;
			}
		},
		volatileStatus: 'partiallytrapped',
		self: {
			volatileStatus: 'partialtrappinglock',
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
	},
	yawn: {
		gen: 1,
		num: 281,
		accuracy: 75,
    	basePower: 0,
		category: "Status",
		name: "Yawn",
		desc: "Causes the target to fall asleep for 2-3 turns.",
		shortDesc: "Target falls asleep for 2-3 turns.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1},
		status: 'slp',
		onHit(target, source, move) {
			this.effectState.startTime = this.random(2, 4);
			this.effectState.time = this.effectState.startTime;
		},	
		secondary: null,
		target: "normal",
		type: "Normal",
	},
};
