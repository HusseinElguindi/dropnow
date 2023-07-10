import type { PeerConnection } from './webrtc';

interface FileInfo {
	filename: string;
	size: number;
	mime: string;
}
interface UploadTerm {
	done: boolean;
	error: boolean;
}

const chunkSize = 64 * 1024;

interface Upload {
	progress: number;
	uploaded: number;
}
interface Download {
	file?: FileInfo;
	data: ArrayBuffer[];
	progress: number;
	downloaded: number;
}

export class PeerFileIO {
	pc: PeerConnection;
	datac: RTCDataChannel;

	upload: Upload = { progress: 0, uploaded: 0 };
	download: Download = { data: [], progress: 0, downloaded: 0 };

	ondownloadprogress?: (progress: number, downloaded: number) => void;
	ondownloadcomplete?: (file: FileInfo, objectURL: string) => void;
	onuploadprogress?: (progress: number, uploaded: number) => void;

	constructor(pc: PeerConnection, datac: RTCDataChannel) {
		this.pc = pc;
		this.datac = datac;

		datac.onmessage = (ev: MessageEvent<string | ArrayBuffer>) => {
			if (typeof ev.data === 'string') {
				let info: FileInfo | UploadTerm = JSON.parse(ev.data);
				if ((info as FileInfo)?.filename !== undefined) {
					this.download = {
						file: info as FileInfo,
						data: [],
						progress: 0,
						downloaded: 0
					};
					this.ondownloadprogress &&
						this.ondownloadprogress(this.download.progress, this.download.downloaded);
				} else {
					let uploadTerm = info as UploadTerm;
					if (uploadTerm.done && this.ondownloadcomplete) {
						const received = new Blob(this.download.data, { type: this.download.file?.mime });
						this.ondownloadcomplete &&
							this.ondownloadcomplete(this.download.file!, URL.createObjectURL(received));
					}
				}
			} else {
				this.download.downloaded += ev.data.byteLength;
				this.download.data.push(ev.data);
				if (this.download.file?.size !== 0) {
					this.download.progress = this.download.downloaded / this.download.file!.size;
				}
				this.ondownloadprogress &&
					this.ondownloadprogress(this.download.progress, this.download.downloaded);
			}
		};
	}

	async send(data: ArrayBuffer) {
		// if sending data too fast, then wait
		if (this.datac.bufferedAmount > this.datac.bufferedAmountLowThreshold) {
			await new Promise<void>((resolve, _) => {
				this.datac.onbufferedamountlow = () => {
					this.datac.onbufferedamountlow = null;
					resolve();
				};
			});
		}
		this.datac.send(data);
		return data.byteLength;
	}

	async sendFile(file: File) {
		if (this.datac.readyState !== 'open') {
			return;
		}

		this.upload = { progress: 0, uploaded: 0 };
		this.onuploadprogress && this.onuploadprogress(this.upload.progress, this.upload.uploaded);

		let uploadInfo: FileInfo = {
			filename: file.name,
			size: file.size,
			mime: file.type
		};
		this.datac.send(JSON.stringify(uploadInfo));

		const uploadChunk = async (start: number, end: number) => {
			const data = await file.slice(start, end).arrayBuffer();
			let uploaded = await this.send(data);

			this.upload.uploaded += uploaded;
			this.upload.progress = this.upload.uploaded / file.size;

			this.onuploadprogress && this.onuploadprogress(this.upload.progress, this.upload.uploaded);
		};

		let start: number = 0;
		let end: number = 0;

		while (end + chunkSize <= file.size) {
			end += chunkSize;
			await uploadChunk(start, end);
			start = end;
		}
		end = file.size;
		await uploadChunk(start, end);

		let uploadTerm: UploadTerm = { done: true, error: false };
		this.datac.send(JSON.stringify(uploadTerm));
	}
}
