<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$components/ui/card';
	import { Progress } from '$components/ui/progress';

	export let progress: number;
</script>

<Card>
	<CardHeader>
		<CardTitle>Receive</CardTitle>
		<CardDescription>Track your receive progress</CardDescription>
	</CardHeader>
	<CardContent class="space-y-3">
		<Progress value={progress} max={1} />
	</CardContent>
</Card>
