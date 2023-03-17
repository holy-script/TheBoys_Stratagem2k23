import Phaser from 'phaser';
import { eventsCenter } from '../utils/eventsCenter';
import gsap from 'gsap';

export class Play extends Phaser.Scene {
	constructor() {
		super({
			key: 'Play',
			active: true,
		});
	}

	create() {
		this.scene.setVisible(false, 'Play');
		const txt = this.add.text(100, 100, 'Hello World').setAlpha(0);
		eventsCenter.on('start-play', () => {
			this.scene
				.setVisible(false, 'Logo')
				.setVisible(true, 'Play')
				.remove('Logo');
			const duration = 1;
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
	}
}
