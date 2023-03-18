import Phaser from 'phaser';
import { eventsCenter } from '../utils/eventsCenter';
import gsap from 'gsap';
import heroSpriteSheet from 'assets/sprites/hero.png';
import wispSpriteSheet from 'assets/sprites/wisp.png';
import fog from 'assets/sprites/fog.png';
import forestTiles from 'assets/tilemaps/forestTilesetExtruded.png';
import forestTilemap from 'assets/tilemaps/woodlands.json';
import { Player } from '../prefabs/player';

export class Play extends Phaser.Scene {
	hero!: Player;
	camera!: Phaser.Cameras.Scene2D.Camera;
	rt!: Phaser.GameObjects.RenderTexture;
	vision!: Phaser.GameObjects.Image;

	constructor() {
		super({
			key: 'Play',
			active: true,
		});
	}

	preload() {
		this.load.spritesheet('hero', heroSpriteSheet, {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.spritesheet('wisp', wispSpriteSheet, {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.image('fog', fog);
		this.load.image('tileset', forestTiles);
		this.load.tilemapTiledJSON('tilemap', forestTilemap);
	}

	create() {
		this.scene.setVisible(false, 'Play');
		const txt = this.add.text(100, 100, 'Hello World').setAlpha(0);
		eventsCenter.on('start-play', () => {
			this.scene
				.setVisible(false, 'Logo')
				.setVisible(true, 'Play')
				.remove('Logo');
			const duration = 0.1;
			gsap.fromTo(
				txt,
				{
					alpha: 0,
				},
				{
					alpha: 1,
					duration,
					ease: 'linear',
				}
			);
		});

		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage('forestTilesetExtruded', 'tileset');
		const ground = map.createLayer('Ground', tileset).setDepth(0);
		const trees = map.createLayer('Trees', tileset).setDepth(1);
		ground.setCollisionByProperty({
			collides: true,
		});
		trees.setCollisionByProperty({
			collides: true,
		});

		const playerSpawn = map.findObject(
			'Spawns',
			(obj) => obj.name === 'Player'
		);

		this.hero = new Player(
			this,
			playerSpawn.x || 163,
			playerSpawn.y || 2840,
			'hero'
		).setDepth(5);
		this.physics.world.setBounds(
			0,
			0,
			map.widthInPixels,
			map.heightInPixels
		);
		this.hero.setCollideWorldBounds(true);
		this.physics.add.collider(this.hero, ground);
		this.physics.add.collider(this.hero, trees);
		this.hero.setTint(0x5aaafa);

		this.camera = this.cameras.main;
		this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.camera.startFollow(this.hero);

		// const debugGraphics = this.add.graphics().setAlpha(0.75);
		// ground.renderDebug(debugGraphics, {
		// 	tileColor: null, // Color of non-colliding tiles
		// 	collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
		// });
		// trees.renderDebug(debugGraphics, {
		// 	tileColor: null, // Color of non-colliding tiles
		// 	collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
		// });
		// this.physics.world.createDebugGraphic();

		this.rt = this.make.renderTexture(
			{
				width: map.widthInPixels,
				height: map.heightInPixels,
			},
			true
		);
		this.rt.fill(0x000000, 1);
		this.rt.draw(ground);
		this.rt.draw(trees);
		this.rt.setTint(0x0a2948);
		this.rt.setDepth(4);
		this.vision = this.add
			.image(this.hero.x, this.hero.y, 'fog')
			.setDepth(3)
			.setScale(3)
			.setAlpha(0.2);
		this.rt.mask = new Phaser.Display.Masks.BitmapMask(this, this.vision);
		this.rt.mask.invertAlpha = true;
	}

	update() {
		this.vision.x = this.hero.x;
		this.vision.y = this.hero.y;
	}
}
