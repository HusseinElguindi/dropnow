<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const { roomID } = data;

	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { PeerConnection, SignalChannel } from '$p2p';
	import { PeerFileIO } from '$p2p/fileio';
	import { Badge } from '$components/ui/badge';
	import SendFormCard from '$components/room/send/SendFormCard.svelte';
	import SendProgressCard from '$components/room/send/SendProgressCard.svelte';
	import ReceiveProgressCard from '$components/room/receive/ReceiveProgressCard.svelte';
	import ConnectionProgressCard from '$components/room/ConnectionProgressCard.svelte';
	import ShareLinkCard from '$components/room/ShareLinkCard.svelte';

	let downloadAnchor: HTMLAnchorElement;

	let isSending: boolean = false;

	let sc: SignalChannel;
	let scStatus: 'connected' | 'closed';

	let pc: PeerConnection;
	let rtcStatus: RTCPeerConnectionState;

	let pf: PeerFileIO;

	let uploadProgress = 0;
	let downloadProgress = 0;

	const handleSend = ({ detail: { files } }: CustomEvent<{ files: FileList }>) => {
		isSending = true;
		files?.length && pf?.sendFile(files[0]);
	};

	onMount(async () => {
		const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = !dev ? window.location.host : 'localhost:8000';
		// const URL = `${wsProtocol}//${host}/ws/${roomID}`;
		const URL = `wss://dropnow.elguindi.xyz/ws/${roomID}`;

		sc = new SignalChannel();
		sc.onstatus = (status) => (scStatus = status);
		const roomInfo = await sc.connect(URL);

		pc = new PeerConnection(sc, roomInfo.polite);
		pc.conn.onconnectionstatechange = () => (rtcStatus = pc.conn.connectionState);
		pc.conn.oniceconnectionstatechange = () => {
			switch (pc.conn.iceConnectionState) {
				case 'closed':
				case 'failed':
					pc.conn.restartIce();
					// TODO: ask user to retry
					break;
			}
		};

		let datac = pc.conn.createDataChannel('dataChan', { negotiated: true, id: 0, ordered: true });
		datac.binaryType = 'arraybuffer';

		pf = new PeerFileIO(pc, datac);
		pf.onuploadprogress = (progress) => (uploadProgress = progress);
		pf.ondownloadprogress = (progress) => (downloadProgress = progress);
		pf.ondownloadcomplete = (file, objectURL) => {
			downloadAnchor.href = objectURL;
			downloadAnchor.download = file.filename;
			downloadAnchor.type = file.mime;
			downloadAnchor.click();
		};

		roomInfo?.has_pair && pc.negotiate();
	});
</script>

<div class="w-full max-w-md sm:max-w-sm mx-auto space-y-4 mt-[8rem]">
	<div class="flex gap-3">
		<h1 class="text-3xl md:text-4xl font-bold leading-tight tracking-tighter">Room</h1>
		<Badge
			variant="outline"
			class="text-2xl md:text-3xl backdrop-blur-[1px] whitespace-nowrap overflow-x-auto"
		>
			{roomID}
		</Badge>
	</div>

	<ConnectionProgressCard {scStatus} {rtcStatus} />

	{#if rtcStatus === 'connected'}
		{#if !isSending}
			<SendFormCard on:send={handleSend} />
		{:else}
			<SendProgressCard progress={uploadProgress} on:cancel={() => (isSending = false)} />
		{/if}
		<ReceiveProgressCard progress={downloadProgress} />
		<a hidden bind:this={downloadAnchor} href="/#" target="_blank" referrerpolicy="no-referrer">
			download
		</a>
	{:else}
		<ShareLinkCard />
	{/if}
</div>
