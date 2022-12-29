<script lang="ts">
    'use-strict';

    import SendButton from "../components/SendButton/SendButton.svelte";
    import { SignalChannel } from '../signal';
    import { PeerConnection } from '../webrtc';

    export let params: { id: string };
    const { id } = params;

    let sc: SignalChannel;
    let pc: PeerConnection;
    let rtcStatus: RTCPeerConnectionState;

    let datac: RTCDataChannel;

    const SignalRTC = async () => {
        const host = window.location.host;
        const wsProtocol = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
        console.log({ wsProtocol, hostname: host });

        sc = new SignalChannel();

        let roomInfo = await sc.connect(`${wsProtocol}//${host}/ws/${id}`);
        sc.ws.onerror = (err) => console.log(err);

        pc = new PeerConnection(sc, roomInfo?.polite);

        datac = pc.conn.createDataChannel('dataChan', { negotiated: true, id: 0, ordered: true });
        datac.binaryType = 'arraybuffer';

        let data: ArrayBuffer[] = [];
        let receivedBytes = 0;
        let fileInfo: UploadInfo;
        datac.onmessage = (ev: MessageEvent<string | ArrayBuffer>) => {
            // console.log('recieved:', ev.data);
            
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
                data.push(ev.data);
                if (fileInfo.size != 0) {
                    downloadProg = receivedBytes / fileInfo.size;
                    console.log(downloadProg)
                }
            }
        };

        // Register RTC events
        pc.conn.onconnectionstatechange = () => {
            rtcStatus = pc.conn.connectionState;
            if (pc.conn.connectionState === 'connected') {
                console.log('connected!');
            }
        }

        // TODO: TEST THIS
        pc.conn.oniceconnectionstatechange = () => {
            switch (pc.conn.iceConnectionState) {
                case 'closed':
                case 'failed':
                    pc.conn.restartIce();
                    // TODO: ask user to retry
                    // close the connection
                    break;
            }
        };

        if (roomInfo?.has_pair) {
            pc.negotiate();
        }
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

    const chunkSize = 64 * 1024;
    const sendMsg = async () => {
        if (datac?.readyState == 'open') {
            var file: File = files[0]; // TODO: support multiple files

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

    {#if rtcStatus != 'connected'}
        {#if rtcStatus == 'connecting'}
            <p>Connecting...</p>
        {:else}
            <p>Waiting for peer.</p>
        {/if}
    {/if}

    <input hidden={rtcStatus !== 'connected'} type="file" bind:files>
    <SendButton hidden={rtcStatus !== 'connected'} on:click={sendMsg}>Send</SendButton>

    <div style="display:{rtcStatus !== 'connected' ? 'none': 'flex'}; flex-direction:column;">
        <progress value={uploadProg} max="1">{uploadProg}%</progress>
        <progress value={downloadProg} max="1">{downloadProg}%</progress>
    </div>
    <a hidden bind:this={downloadAnchor} href="/#">download</a>
</main>

<div id="status">
    <p>ws</p>
    <span class="status-dot {sc.status == 'connected' ? 'green' : 'red'}"></span>

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
