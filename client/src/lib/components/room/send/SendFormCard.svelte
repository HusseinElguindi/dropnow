<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$components/ui/card';
	import { InputFile } from '$components/ui/input';
	import { Button } from '$components/ui/button';
	import { createEventDispatcher } from 'svelte';
	import { Send } from 'lucide-svelte';

	let files: FileList;

	const dispatch = createEventDispatcher<{ send: { files: FileList } }>();
	const handleSend = () => {
		dispatch('send', { files });
	};
</script>

<Card>
	<CardHeader>
		<CardTitle>Send</CardTitle>
		<CardDescription>Select a file to send</CardDescription>
	</CardHeader>
	<CardContent class="space-y-3">
		<InputFile bind:files />
		<Button class="w-full" on:click={handleSend} disabled={!files}>
			<Send class="mr-2 h-3.5 w-3.5" />Send
		</Button>
	</CardContent>
</Card>
