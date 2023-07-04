<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const { roomID } = data;

	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$components/ui/card';
	import { Badge } from '$components/ui/badge';
	import { InputFile } from '$components/ui/input';
	import { Button } from '$components/ui/button';

	let files: FileList;
</script>

<div class="w-full max-w-md sm:max-w-sm mx-auto space-y-4 mt-[8rem]">
	<div class="flex gap-3">
		<h1 class="text-3xl md:text-4xl font-bold leading-tight tracking-tighter">Room</h1>
		<Badge variant="outline" class="text-2xl md:text-3xl backdrop-blur-[1px] whitespace-nowrap overflow-x-auto">
			{roomID}
		</Badge>
	</div>
	<Card>
		<CardHeader>
			<CardTitle>Send</CardTitle>
			<CardDescription>Select a file to send</CardDescription>
		</CardHeader>
		<CardContent class="space-y-3">
			<InputFile bind:files />
			<Button class="w-full">Send</Button>
		</CardContent>
	</Card>
</div>
