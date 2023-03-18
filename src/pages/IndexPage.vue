<template>
	<q-page>
		<div id="game-container" ref="root" class="bg-black">
			<q-spinner-hourglass
				class="absolute-center"
				v-if="!downloaded"
				color="red"
				size="8em"
			/>
		</div>
		<q-dialog v-model="store.paused">
			<q-card bordered>
				<q-card-section>
					<div class="text-h6 text-center">Game Paused</div>
				</q-card-section>

				<q-card-section class="q-pt-none">
					Please click the Pause button or Escape Key to resume the game.
				</q-card-section>
			</q-card>
		</q-dialog>
		<q-page-sticky position="bottom-right" :offset="[18, 18]">
			<q-btn
				color="blue"
				:icon="store.paused ? 'play_arrow' : 'pause'"
				push
				@click="store.togglePause()"
			/>
		</q-page-sticky>
		<q-page-sticky position="top-left" :offset="[18, 18]">
			<div class="relative-position">
				<q-img id="health-bg" :src="healthBarBg" />
				<div id="health-bar">
					<q-img id="health" :src="healthBar" />
				</div>
			</div>
			<div class="text-h6 text-white q-ml-lg">{{ store.health }}</div>
		</q-page-sticky>
		<q-page-sticky position="bottom-left" :offset="[18, 18]">
			<div class="text-center">
				<q-icon
					v-for="i in store.specialCount"
					:key="i"
					size="md"
					color="teal"
					name="star_rate"
				/>
			</div>
			<div class="text-h6 text-white">Special Ability</div>
		</q-page-sticky>
	</q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useStore } from 'stores/app';
import healthBarBg from 'assets/health-bar-bg.png';
import healthBar from 'assets/health-bar.png';

export default defineComponent({
	name: 'IndexPage',
	setup() {
		const store = useStore();
		const downloaded = ref(false);
		const root = ref<HTMLDivElement>();
		let gameInstance: Phaser.Game;

		onMounted(async () => {
			const game = await import('../core/game');
			downloaded.value = true;
			nextTick(() => {
				if (typeof root.value !== 'undefined')
					gameInstance = game.launch(root.value);
			});
		});

		onUnmounted(() => {
			gameInstance?.destroy(false, false);
		});

		return {
			downloaded,
			root,
			store,
			healthBarBg,
			healthBar,
		};
	},
});
</script>

<style lang="sass">
#game-container
  width: 100vw
  height: 100vh
  background: black
  position: fixed

#health-bg
  width: 256px
  height: 68px
  img
    image-rendering: pixelated

#health-bar
  width: 196px
  height: 68px
  position: absolute
  left: 58px
  top: 0
  overflow: hidden

#health
  width: 196px
  height: 68px
  max-width: 196px
  img
    image-rendering: pixelated
</style>
