<script lang="ts">
	import { Badge } from '$components/ui/badge';
	import { Card, CardContent } from '$components/ui/card';
	import { cn } from '$lib/utils';
	export let scStatus: 'connected' | 'closed' = 'closed';
	export let rtcStatus: RTCPeerConnectionState;

	let scStatusColor: string = '';
	$: switch (scStatus) {
		case 'connected':
			scStatusColor = 'bg-green-500';
			break;
		case 'closed':
			scStatusColor = 'bg-red-500';
			break;
	}

	let rtcStatusColor: string = '';
	$: switch (rtcStatus) {
		case 'new':
		case 'connected':
			rtcStatusColor = 'bg-green-500';
			break;
		case 'connecting':
			rtcStatusColor = 'bg-amber-500';
			break;
		case 'disconnected':
		case 'failed':
		case 'closed':
			rtcStatusColor = 'bg-red-500';
			break;
	}
</script>

<Card>
	<CardContent class="p-6 py-4 text-sm space-y-1">
		<div class="flex items-center gap-1.5 justify-between">
			Signal Server
			<Badge class={cn('pointer-events-none', scStatusColor)}>{scStatus}</Badge>
		</div>
		<div class="flex items-center gap-1.5 justify-between">
			Peer Connection
			<Badge class={cn('pointer-events-none', rtcStatusColor)}
				>{rtcStatus ?? 'waiting for peer'}</Badge
			>
		</div>
	</CardContent>
</Card>
