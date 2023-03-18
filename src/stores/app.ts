import { defineStore } from 'pinia';
import gsap from 'gsap';

export const useStore = defineStore('main', {
	state: () => ({
		paused: false,
		health: 100,
		damage: 0,
		gameOver: false,
		playerX: 0,
		playerY: 0,
	}),

	getters: {},

	actions: {
		togglePause() {
			this.paused = !this.paused;
		},
		takeHit(dmg: number) {
			if (this.health > 0) {
				this.health -= dmg;
				gsap.to(document.getElementById('health-bar'), {
					width: `${(this.health / 100) * 196}px`,
					duration: 0.5,
				});
			}
		},
	},
});
