<template>
	<q-page class="row items-center justify-evenly bg-grey">
		<div ref="root">
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
