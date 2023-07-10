<script lang="ts">
	import { Input } from '$components/ui/input';
	import { Button } from '$components/ui/button';
	import { Shuffle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { v4 as uuidv4 } from 'uuid';

	let roomID: string = '';
	// Replace spaces
	$: roomID = roomID.replaceAll(' ', '-');

	const gotoRoom = (id: string) => goto(`/room/${id}`);
	const handleKeydown = (e: KeyboardEvent) => e.key == 'Enter' && gotoRoom(roomID);
</script>

<div class="w-full max-w-md sm:max-w-lg mx-auto space-y-5 mt-[8rem] text-center">
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
			<Input
				class="max-w-[12rem] backdrop-blur-[1px] text-ellipsis"
				placeholder="Room ID"
				bind:value={roomID}
				on:keydown={handleKeydown}
			/>
			<Button disabled={!roomID} on:click={() => gotoRoom(roomID)}>Join</Button>
			<Button variant="outline" class="backdrop-blur-[1px]" on:click={() => (roomID = uuidv4())}>
				<Shuffle class="w-4" strokeWidth={1.75} />
			</Button>
		</div>
		<p class="text-muted-foreground text-sm">Enter an ID to join/create a room.</p>
	</div>
</div>
