<script lang="ts">
	import { Input } from '$components/ui/input';
	import { Button } from '$components/ui/button';
	import Background from '$components/ui/background/Background.svelte';

	let roomID: string = '';
	// Replace spaces
	$: roomID = roomID.replaceAll(' ', '-');
</script>

<Background />
<div class="max-w-md sm:max-w-lg mx-auto space-y-5 text-center mt-[8rem]">
	<h1 class="text-4xl sm:text-6xl font-bold leading-[1.15] sm:leading-[1.15] tracking-tight">
		A <span class="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
			New Era
		</span>
		of<br /> File Sharing
	</h1>
	<p class="text-muted-foreground sm:text-lg">
		DropNow is an open-source, peer-to-peer file transfer service; no intermediate server touches
		your data, ever.
	</p>
	<div class="space-y-3 pt-3">
		<div class="flex justify-center gap-2 mx-auto w-full">
			<Input class="max-w-[15rem] backdrop-blur-[1px]" placeholder="Room ID" bind:value={roomID} />
			<Button disabled={!roomID}>Join</Button>
		</div>
		<p class="text-muted-foreground text-sm">Enter an ID to join/create a room.</p>
	</div>
</div>
