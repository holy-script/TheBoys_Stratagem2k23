import Phaser from 'phaser';
import { StateMachine, State, StateStore } from '../utils/fsm';
import { useStore } from 'stores/app';
import { AnimState } from './player';
import { EnemyInput } from '../utils/inputs';

const store = useStore();

class EnemyState extends State {
	controls: EnemyInput;
	constructor(sprite: Enemy, name: string, controls: EnemyInput) {
		super(sprite, name);
		this.controls = controls;
	}
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
	health: number;
	scene: Phaser.Scene;
	animData!: AnimState<typeof EnemyState>[];
	controls: EnemyInput;
	fsm!: StateMachine;
	name: string;
	damage: number;
	follow: boolean;
	offsetX: number;
	offsetY: number;
	distX!: number;
	distY!: number;

	constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
		super(scene, x, y, name);
		this.scene = scene;
		this.name = name;
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.controls = new EnemyInput(scene, this);

		this.setScale(2);
		this.damage = 10;
		this.follow = false;

		this.health = 100;
		this.offsetX = 42;
		this.offsetY = 10;
	}

	getAnims(val: AnimState<typeof EnemyState>[]) {
		this.animData = val;
	}

	create() {
		let start = -1,
			end = 0;
		const states: StateStore = {};
		for (const obj of this.animData) {
			end = start + obj.length;
			start++;
			this.anims.create({
				key: obj.name,
				frames: this.anims.generateFrameNumbers(this.name, {
					start,
					end,
				}),
				frameRate: obj?.rate ? obj.rate : 10,
				repeat: obj?.repeat ? -1 : 0,
			});
			start = end;
			if (obj?.state)
				states[obj.name] = new obj.state(this, obj.name, this.controls);
		}
		this.fsm = new StateMachine('idle', states);
	}

	preUpdate(time: number, delta: number) {
		if (!store.paused) {
			super.preUpdate(time, delta);

			this.controls.getActions();

			if (!this.controls.DEAD) this.fsm.step();
		} else this.setVelocity(0);
	}
}

export const bossAnims: AnimState<typeof EnemyState>[] = [
	{
		name: 'idle',
		length: 8,
		repeat: true,
		state: class IdleState extends EnemyState {
			found!: boolean;

			enter() {
				this.sprite.play(this.name);
				this.found = false;
			}
			execute() {
				if (this.controls.MOVING) this.machine.transition('run');

				if (
					this.sprite.distX <= this.sprite.offsetX &&
					this.sprite.distY <= this.sprite.offsetY &&
					store.health > 0 &&
					!this.found
				) {
					this.found = true;
					setTimeout(() => {
						this.found = false;
						if (!this.controls.DEAD)
							this.machine.transition('attack');
					}, 1000);
				}
			}
		},
	},
	{
		name: 'run',
		length: 8,
		repeat: true,
		state: class RunState extends EnemyState {
			enter() {
				this.sprite.play(this.name);
			}
			execute() {
				if (!this.controls.MOVING) this.machine.transition('idle');
			}
			exit() {
				this.sprite.setVelocity(0);
			}
		},
	},
	{
		name: 'attack',
		length: 5,
		state: class AttackState extends EnemyState {
			hitting!: boolean;

			enter() {
				this.hitting = true;
				this.sprite.play(this.name);
				this.sprite.once('animationcomplete', () => {
					if (
						this.sprite.distX <= this.sprite.offsetX &&
						this.sprite.distY <= this.sprite.offsetY &&
						this.hitting
					) {
						store.takeHit(this.sprite.damage);
					}
					this.machine.transition('idle');
				});

				this.sprite.body.setSize(47, 38);
				this.sprite.body.setOffset(this.sprite.flipX ? 2 : 14, 27);
			}
			execute() {
				this.sprite.setVelocity(0);

				if (this.controls.DEAD || this.controls.HURT)
					this.hitting = false;
			}
			exit() {
				this.sprite.body.setSize(35, 38);
				this.sprite.body.setOffset(14, 27);
			}
		},
	},
	{
		name: 'hurt',
		length: 4,
		state: class HurtState extends EnemyState {
			enter() {
				this.sprite.setVelocity(0);
				this.sprite.play(this.name);
				this.sprite.once('animationcomplete', () => {
					this.machine.transition('idle');
				});
			}
			exit() {
				this.controls.HURT = false;
			}
		},
	},
	{
		name: 'death',
		length: 6,
		state: class DeathState extends EnemyState {
			enter() {
				this.sprite.setVelocity(0);
				this.sprite.play(this.name);
				this.sprite.once('animationcomplete', () => {
					this.sprite.active = false;
					this.sprite.visible = false;
					this.sprite.destroy(true);
				});
			}
		},
	},
];
