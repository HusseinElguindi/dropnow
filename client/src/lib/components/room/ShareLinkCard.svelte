<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { onMount } from 'svelte';
	import { Check, Copy } from 'lucide-svelte';

	let displayURL: string;
	let copyURL: string;
	onMount(() => {
		console.log(window.location);
		displayURL = `${window.location.host}${window.location.pathname}`;
		copyURL = `${window.location.origin}${window.location.pathname}`;
	});

	let checkmark = false;
	const handleCopyURL = () => {
		navigator?.clipboard && navigator.clipboard.writeText(copyURL);
		checkmark = true;
		setTimeout(() => {
			checkmark = false;
		}, 1000);
	};
</script>

<Card>
	<CardHeader class="pb-3">
		<CardTitle>Share</CardTitle>
		<CardDescription>Share a link to the room</CardDescription>
	</CardHeader>
	<CardContent class="flex gap-2">
		<Input class="focus-visible:ring-0" value={displayURL} readonly />
		<Button variant="outline" class="p-3 h-10 w-10" on:click={handleCopyURL}>
			{#if checkmark}
				<Check class="text-muted-foreground" />
			{:else}
				<Copy class="text-muted-foreground" />
			{/if}
		</Button>
	</CardContent>
</Card>
