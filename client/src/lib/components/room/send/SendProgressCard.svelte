<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Progress } from '$components/ui/progress';
	import { createEventDispatcher } from 'svelte';

	export let progress: number;

	const dispatch = createEventDispatcher<{ cancel: string }>();
	const handleCancel = () => {
		dispatch('cancel', '');
	};
</script>

<Card>
	<CardHeader>
		<CardTitle>Send</CardTitle>
		<CardDescription>Track your send progress</CardDescription>
	</CardHeader>
	<CardContent class="space-y-3">
		<Progress value={progress} max={1} />
		<Button class="w-full" on:click={handleCancel}
			>{progress === 1 ? 'Send another file' : 'Cancel'}</Button
		>
	</CardContent>
</Card>
