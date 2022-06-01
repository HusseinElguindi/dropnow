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

    import Button from "../components/Button/Button.svelte";
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
        /* const hostname = window.location.hostname; */
        /* const hostname = window.location.host; */
        /* hostname = '0.0.0.0:3000'; */
        hostname = '192.168.2.249:3000';
        /* hostname = '127.0.0.1:3000'; */
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
        datac = pc.createDataChannel('dataChan', { negotiated: true, id: 0, ordered: true });
        datac.binaryType = "arraybuffer";

        let data: ArrayBuffer[] = [];
        let receivedBytes = 0;
        let fileInfo: UploadInfo;
        datac.onmessage = (ev: MessageEvent<string | ArrayBuffer>) => {
            console.log('recieved:', ev.data);
            
            if (typeof ev.data == "string") {
                let info: UploadInfo | UploadTerm = JSON.parse(ev.data);
                if ((info as UploadInfo)?.filename !== undefined) {
                    fileInfo = info as UploadInfo;
                    data = [];
                    receivedBytes = 0;
                    downloadProg = 0;
                }
                else {
                    let uploadTerm = info as UploadTerm;
                    if (uploadTerm.done) {
                        const received = new Blob(data, { type: fileInfo.mime });
                        console.log("blob len", received.size);
                        downloadAnchor.href = URL.createObjectURL(received);
                        downloadAnchor.download = fileInfo.filename;

                        downloadAnchor.click();
                    }
                }
            }
            else {
                receivedBytes += ev.data.byteLength;
                console.log(receivedBytes)
                data.push(ev.data);
                if (fileInfo.size != 0) {
                    downloadProg = receivedBytes / fileInfo.size;
                    console.log(downloadProg)
                }
            }
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
    
    interface UploadInfo {
        filename: string,
        size: number,
        mime: string
    }
    interface UploadTerm {
        done: boolean,
        error: boolean
    }

    const chunkSize = 16 * 1024;
    let msgContent: string;
    const sendMsg = async () => {
        if (datac?.readyState == 'open') {
            var file: File = files[0];

            uploadedBytes = 0;
            uploadProg = 0;

            let uploadInfo: UploadInfo = {
                filename: file.name,
                size: file.size,
                mime: file.type
            };
            datac.send(JSON.stringify(uploadInfo));

            let start: number = 0;
            let end: number = 0;

            while (end + chunkSize <= file.size) {
                end += chunkSize;
                await send(start, end, file);
                start = end;
            }
            end = file.size;
            await send(start, end, file);

            let uploadTerm: UploadTerm = { done: true, error: false };
            datac.send(JSON.stringify(uploadTerm));
            
            /* datac.send(msgContent); */
            msgContent = '';
        }
    };

    let uploadedBytes = 0;
    const send = async (start: number, end: number, file: File) => {
        if (datac.bufferedAmount > datac.bufferedAmountLowThreshold) {
            await new Promise<void>((resolve, _) => {
                datac.onbufferedamountlow = () => {
                    datac.onbufferedamountlow = null;
                    resolve();
                }
            });
        }

        let data = await file.slice(start, end).arrayBuffer()
        datac.send(data);
        uploadedBytes += data.byteLength;
        uploadProg = uploadedBytes / file.size;
    }

    let files: FileList;
    let downloadAnchor: any;

    let uploadProg: number = 0;
    let downloadProg: number = 0;
</script>

<main>
    <h1>Room {id}</h1>

<!--
    <p>ws: {wsStatus}</p>
    <p>rtc: {rtcStatus}</p>
    <p>ice: {iceConnState}</p>
-->

    {#if rtcStatus != 'connected'}
        <Button on:click={connect}>Connect</Button>
    {/if}


    <ButtonInput hidden={rtcStatus !== 'connected'} bind:value={msgContent} placeholder="Send message" on:click={sendMsg} />

    <input hidden={rtcStatus !== 'connected'} type="file" bind:files>

    <div style="display:{rtcStatus !== 'connected' ? 'none': 'flex'}; flex-direction:column;">
        <progress value={uploadProg} max="1">{uploadProg}%</progress>
        <progress value={downloadProg} max="1">{downloadProg}%</progress>
    </div>
    <a hidden bind:this={downloadAnchor} href="/#">download</a>

</main>
<div id="status">
    <p>ws</p>
    <span class="status-dot {wsStatus == 'connected' ? 'green' : 'red'}"></span>

    <p>rtc</p>
    <span class="status-dot {rtcStatus == 'connected' ? 'green' : rtcStatus == 'connecting' ? 'yellow' : 'red'}"></span>
</div>

<style>
    .status-dot {
        margin-left: 0.25rem;
        margin-right: 0.75em;

        height: 0.5rem;
        width: 0.5rem;
        border-radius: 50%;
        display: inline-block;
    }

    .status-dot.green {
        background-color: #00CA4E;
    }
    .status-dot.yellow {
        background-color: #FFBD44;
    }
    .status-dot.red {
        background-color: #FF605C;
    }

    #status {
        position: fixed;
        bottom: 0.5em;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
