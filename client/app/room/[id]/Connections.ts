import { SignalChannel, RoomInfo } from "@/src/lib/scripts/signal"
import { PeerConnection } from "@/src/lib/scripts/webrtc"


export const createSignalChannel = async (url: string) => {
  const sc = new SignalChannel();
  const roomInfo = await sc.connect(url);
  if (sc.ws) {
    sc.ws.onerror = (err) => console.log(err);
  }
  return { sc, roomInfo };
};


// Metadata for the initiation of a file upload.
interface UploadInfo {
  filename: string,
  size: number,
  mime: string
}
// Contains a URL to the resource.
export interface DownloadObj extends UploadInfo {
  URL: string,
}
// Metadata for the termination of a file upload.
interface UploadTerm {
  done: boolean,
  error: boolean
}


interface UsePeerConnectionProps {
  sc: SignalChannel,
  roomInfo: RoomInfo,

  handleDownloadProgress: (p: number) => void,
  handleUploadProgress: (p: number) => void,

  // TODO: break into general handleDownload with success and error funcs
  handleDownloadObj: (obj: DownloadObj) => void,

  handleStatus: (s: RTCPeerConnectionState) => void,
}

export const createPeerConnection = async ({ sc, roomInfo, handleDownloadProgress, handleUploadProgress, handleDownloadObj, handleStatus }: UsePeerConnectionProps) => {
  const chunkSize = 64 * 1024;

  const pc = new PeerConnection(sc, roomInfo?.polite);

  const datac = pc.conn.createDataChannel('dataChan', { negotiated: true, id: 0, ordered: true });
  datac.binaryType = 'arraybuffer';


  let data: ArrayBuffer[] = [];
  let receivedBytes = 0;
  let fileInfo: UploadInfo;

  datac.onmessage = (ev: MessageEvent<string | ArrayBuffer>) => {
    if (typeof ev.data == "string") {
      let info: UploadInfo | UploadTerm = JSON.parse(ev.data);
      if ((info as UploadInfo)?.filename !== undefined) {
        fileInfo = info as UploadInfo;
        data = [];
        receivedBytes = 0;
        handleDownloadProgress(0);
      }
      else {
        let uploadTerm = info as UploadTerm;
        if (uploadTerm.done) {
          const received = new Blob(data, { type: fileInfo.mime });
          let downloadObj: DownloadObj = { ...fileInfo, URL: URL.createObjectURL(received) };
          handleDownloadObj(downloadObj);
        }
      }
    }
    else {
      receivedBytes += ev.data.byteLength;
      data.push(ev.data);
      if (fileInfo.size != 0) {
        handleDownloadProgress(receivedBytes / fileInfo.size);
      }
    }
  };

  let uploadedBytes = 0;
  const sendFile = async (file: File) => {
    if (datac?.readyState != 'open') {
      return;
    }

    uploadedBytes = 0;
    handleUploadProgress(0);
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
  };

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
    handleUploadProgress(uploadedBytes / file.size);
  };

  if (roomInfo?.has_pair) {
    pc.negotiate();
  }

  pc.conn.onconnectionstatechange = () => {
    let rtcStatus = pc.conn.connectionState;
    handleStatus(rtcStatus);
  }

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

  return (f: File) => { sendFile(f) };
}
