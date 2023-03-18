<template>
	<q-page>
		<div id="game-container" ref="root" class="bg-grey">
			<q-spinner-hourglass v-if="!downloaded" color="warning" size="4em" />
		</div>
	</q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useStore } from 'stores/app';

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
</style>
