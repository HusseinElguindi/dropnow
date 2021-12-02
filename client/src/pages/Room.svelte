<script lang="ts">
    'use-strict';

    /*
        TODO
            - refactor to classes
            - make one person the caller, and the other a callee
                - would have to use the signalling websocket to inform that a peer joined
            - 2 versions of this webpage, one is a caller, the other is a callee
                - or a button to start/reset the connection
                - or a negotiation is only started if there is another peer in the room
            - try out ice candidate queues (only if other suggestions dont work)
    */

    import ButtonInput from "../components/ButtonInput/ButtonInput.svelte";

    export let params: { id: string };
    const { id } = params;

    let wsStatus: 'connected' | 'closed';

    let pc: RTCPeerConnection;
    let rtcStatus: RTCPeerConnectionState;
    let iceConnState: RTCIceConnectionState;

    let datac: RTCDataChannel;

    let received: string[] = [];

    let connect = () => {};

    let hostname: string;
    const SignalRTC = async () => {
        const hostname = window.location.hostname;
        /* hostname = '0.0.0.0:3000'; */
        let ws = new WebSocket(`ws://${hostname}/ws/${id}`);
        ws.onmessage = (ev) => onsignal(ev.data);
        ws.onclose = () => wsStatus = 'closed';
        ws.onerror = (err) => console.log(err);

        // Wait until websocket connects
        await new Promise<void>((resolve, _) => ws.onopen = () => {
            wsStatus = 'connected';
            resolve();
        });
        console.log()

        const config: RTCConfiguration = {
            iceServers: [{
                /* urls: ['stun:stun.l.google.com:19302', 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] */
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
            },
        ]
        };
        pc = new RTCPeerConnection(config);
        datac = pc.createDataChannel('dataChan', { negotiated: true, id: 0 });
        datac.onmessage = (ev) => {
            console.log('recieved:', ev.data);
            while (received.length > 5) {
                received.shift();
            }
            received = [...received, ev.data];
        };

        // Safari only sends host ice candidates if there are media devices.
        // Otherwise, a TURN server will be used. Uncomment the next section for it to work with STUN.

        // let media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // for (const track of media.getTracks()) {
        //     pc.addTrack(track);
        // }


        // Signal message interface
        interface Signal {
            type: 'sdp' | 'ice-candidate',
            data: object
        };
        // Send a signal to websocket as JSON
        const sendSignal = (signal: Signal) => ws?.send(JSON.stringify(signal));


        // Register RTC events
        pc.onconnectionstatechange = () => {
            rtcStatus = pc.connectionState;
            if (pc.connectionState === 'connected') {
                console.log('connected!');
            }
        }
        pc.onicecandidate = (ev) => sendICECandidate(ev);
        /* pc.onnegotiationneeded = () => negotiate(); */
        pc.oniceconnectionstatechange = () => iceStateChange();
        pc.onsignalingstatechange = () => signalStateChange();
        pc.onicegatheringstatechange = () => console.log(pc.iceGatheringState)

        console.log(pc);
        for (let key in pc) {
            if (/^on/.test(key)) {
                pc.addEventListener(key.slice(2), (ev) => console.log(key, ev));
            }
        };

        // Start negotiation, create an offer and send an SDP signal
        const negotiate = async () => {
            console.log('negotiate');
            // TODO: i think this is redundant
            // let offerOpts: RTCOfferOptions = {
            //     offerToReceiveAudio: true,
            //     offerToReceiveVideo: true
            // }
            const offer = await pc.createOffer();
            await pc.setLocalDescription(new RTCSessionDescription(offer));

            sendSignal({ type: 'sdp', data: offer });
        };
        connect = negotiate;

        // Send an ICE candidate to remote client
        const sendICECandidate = (ev: RTCPeerConnectionIceEvent) => {
            if (ev.candidate) sendSignal({ type: 'ice-candidate', data: ev.candidate });
        };

        const iceStateChange = () => {
            iceConnState = pc.iceConnectionState;
            switch (pc.iceConnectionState) {
                case 'closed':
                case 'failed':
                    pc.restartIce();
                    // TODO: ask user to retry
                    // close the connection
                    break;
            }
        };
        // Same as iceStateChange
        const signalStateChange = () => {
            switch (pc.signalingState) {
                case 'closed':
                    // TODO: ask user to retry
                    // close the connection
                    break;
            }
        };

        const onsignal = async (msg: string) => {
            console.log(msg)
            const signal: Signal = JSON.parse(msg);
            switch (signal?.type) {
                case 'sdp':
                    await onsdp(signal.data as RTCSessionDescriptionInit);
                    break;
                case 'ice-candidate':
                    await pc.addIceCandidate(signal.data);
                    break;
            }
        }

        // Update local and remote client descriptions. If an offer is sent, respond with an offer
        const onsdp = async (sdp: RTCSessionDescriptionInit) => {
            switch (sdp.type) {
                case 'offer':
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    sendSignal({ type: 'sdp', data: answer });
                    break;
                case 'answer':
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    break;
            }
        };

        /* negotiate(); */
    };

    SignalRTC();

    let msgContent: string;
    const sendMsg = () => {
        if (datac?.readyState == 'open') {
            datac.send(msgContent);
            msgContent = '';
        }
    };
</script>

<main>
    <h1>Room {id}</h1>
    <p>ws: {wsStatus}</p>
    <p>rtc: {rtcStatus}</p>
    <p>ice: {iceConnState}</p>

    <ButtonInput bind:value={msgContent} placeholder="Send message" on:click={sendMsg} />
    <p on:click={connect} style="cursor:pointer;">connect</p>

    <p>{hostname}</p>

    <div>
        {#each received as msg}
            <p>{msg}</p>
        {/each}
    </div>
</main>
