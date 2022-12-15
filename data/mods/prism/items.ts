export const Items: {[k: string]: ModdedItemData} = {
	"adamantorb": {
		inherit: true,
		onBasePower: function (basePower, user, target, move) {
			if (move && user.template.species === 'Dialga' && (move.type === 'Steel' || move.type === 'Dragon')) {
				return this.chainModify(1.2);
			}
		},
	},
	"choiceband": {
		inherit: true,
		onStart: function () { },
	},
	"waterring": {
		id: "waterring",
		name: "Water Ring",
		onModifyAtk(atk) {
			return this.chainModify(1.5);
		},
		onModifyEvasion(evasion) {
			return this.chainModify(0.75);
		},
	},
	"choicescarf": {
		inherit: true,
		onStart: function () { },
	},
	"choicespecs": {
		inherit: true,
		onStart: function () { },
	},
	"custapberry": {
		id: "custapberry",
		name: "Custap Berry",
		spritenum: 86,
		isBerry: true,
		naturalGift: {
			basePower: 80,
			type: "Ghost",
		},
		onBeforeTurn: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.ability === 'gluttony')) {
				let decision = this.willMove(pokemon);
				if (!decision) return;
				this.insertQueue({
					choice: 'event',
					event: 'Custap',
					priority: decision.priority + 0.1,
					pokemon: decision.pokemon,
					move: decision.move,
					target: decision.target,
				});
			}
		},
		onCustap: function (pokemon) {
			let decision = this.willMove(pokemon);
			this.debug('custap decision: ' + decision);
			if (decision) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			let decision = this.willMove(pokemon);
			this.debug('custap eaten: ' + decision);
			if (decision) {
				this.cancelDecision(pokemon);
				this.add('-message', "Custap Berry activated.");
				this.runDecision(decision);
			}
		},
		desc: "Activates at 25% HP. Next move used goes first. One-time use.",
	},
	"deepseascale": {
		inherit: true,
		onModifySpD: function (spd, pokemon) {
			if (pokemon.template.species === 'Clamperl') {
				return this.chainModify(2);
			}
		},
	},
	"deepseatooth": {
		inherit: true,
		onModifySpA: function (spa, pokemon) {
			if (pokemon.template.species === 'Clamperl') {
				return this.chainModify(2);
			}
		},
	},
	"focussash": {
		inherit: true,
		onDamage: function () { },
		onTryHit: function (target, source, move) {
			if (target !== source && target.hp === target.maxhp) {
				target.addVolatile('focussash');
			}
		},
		effect: {
			duration: 1,
			onDamage: function (damage, target, source, effect) {
				if (effect && effect.effectType === 'Move' && damage >= target.hp) {
					this.effectState.activated = true;
					return target.hp - 1;
				}
			},
			onAfterMoveSecondary: function (target) {
				if (this.effectState.activated) target.useItem();
				target.removeVolatile('focussash');
			},
		},
	},
	"griseousorb": {
		inherit: true,
		onBasePower: function (basePower, user, target, move) {
			if (user.template.num === 487 && (move.type === 'Ghost' || move.type === 'Dragon')) {
				return this.chainModify(1.2);
			}
		},
	},
	"ironball": {
		inherit: true,
		onEffectiveness: function () {},
		desc: "Holder's Speed is halved and it becomes grounded.",
	},
	"jabocaberry": {
		inherit: true,
		onAfterDamage: function () {},
		onAfterMoveSecondary: function (target, source, move) {
			if (source && source !== target && move && move.category === 'Physical') {
				if (target.eatItem()) {
					this.damage(source.maxhp / 8, source, target, null, true);
				}
			}
		},
	},
	"lifeorb": {
		id: "lifeorb",
		name: "Life Orb",
		spritenum: 249,
		fling: {
			basePower: 30,
		},
		onBasePower: function (basePower, user, target) {
			if (!target.volatiles['substitute']) {
				user.addVolatile('lifeorb');
			}
			return basePower * 1.3;
		},
		effect: {
			duration: 1,
			onAfterMoveSecondarySelf: function (source, target, move) {
				if (move && move.effectType === 'Move' && source && source.volatiles['lifeorb']) {
					this.damage(source.maxhp / 10, source, source, this.items.get('lifeorb'));
					source.removeVolatile('lifeorb');
				}
			},
		},
		num: 270,
		gen: 4,
		desc: "Holder's damaging moves do 1.3x damage; loses 1/10 max HP after the attack.",
	},
	"lightball": {
		inherit: true,
		onModifySpA: function (spa, pokemon) {
			if (pokemon.template.species === 'Pikachu') {
				return this.chainModify(2);
			}
		},
	},
	"luckypunch": {
		inherit: true,
		onModifyCritRatio: function (critRatio, user) {
			if (user.template.species === 'Chansey') {
				return critRatio + 2;
			}
		},
	},
	"lustrousorb": {
		inherit: true,
		onBasePower: function (basePower, user, target, move) {
			if (move && user.template.species === 'Palkia' && (move.type === 'Water' || move.type === 'Dragon')) {
				return this.chainModify(1.2);
			}
		},
	},
	"mentalherb": {
		id: "mentalherb",
		name: "Mental Herb",
		spritenum: 285,
		fling: {
			basePower: 10,
			effect: function (pokemon) {
				if (pokemon.removeVolatile('attract')) {
					this.add('-end', pokemon, 'move: Attract', '[from] item: Mental Herb');
				}
			},
		},
		onUpdate: function (pokemon) {
			if (pokemon.volatiles.attract && pokemon.useItem()) {
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] item: Mental Herb');
			}
		},
		desc: "Cures infatuation. One-time use.",
	},
	"metronome": {
		inherit: true,
		effect: {
			onBasePower: function (basePower, pokemon, target, move) {
				if (pokemon.item !== 'metronome') {
					pokemon.removeVolatile('metronome');
					return;
				}
				if (!this.effectState.move || this.effectState.move !== move.id) {
					this.effectState.move = move.id;
					this.effectState.numConsecutive = 0;
				} else if (this.effectState.numConsecutive < 10) {
					this.effectState.numConsecutive++;
				}
				return basePower * (1 + (this.effectState.numConsecutive / 10));
			},
		},
	},
	"rowapberry": {
		inherit: true,
		onAfterDamage: function () {},
		onAfterMoveSecondary: function (target, source, move) {
			if (source && source !== target && move && move.category === 'Special') {
				if (target.eatItem()) {
					this.damage(source.maxhp / 8, source, target, null, true);
				}
			}
		},
	},
	"stick": {
		inherit: true,
		onModifyCritRatio: function (critRatio, user) {
			if (user.template.species === 'Farfetch\'d') {
				return critRatio + 2;
			}
		},
	},
	"thickclub": {
		inherit: true,
		onModifyAtk: function (atk, pokemon) {
			if (pokemon.template.species === 'Cubone' || pokemon.template.species === 'Marowak') {
				return this.chainModify(2);
			}
		},
	},
};
