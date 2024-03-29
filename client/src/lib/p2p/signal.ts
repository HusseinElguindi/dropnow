interface Signal {
	type: 'sdp' | 'ice-candidate';
	data: object;
}

export interface RoomInfo {
	polite: boolean;
	has_pair: boolean;
}

export class SignalChannel {
	ws?: WebSocket;
	onsignal?: (signal: Signal) => void;
	onstatus?: (status: 'connected' | 'closed') => void;

	async connect(ws: string) {
		this.ws = new WebSocket(ws);

		let roomInfo: RoomInfo = { polite: false, has_pair: false };
		await new Promise<void>(
			(resolve, _) =>
				(this.ws!.onopen = () => {
					this.onstatus && this.onstatus('connected');
					this.ws!.onmessage = ({ data }) => {
						roomInfo = JSON.parse(data);
						resolve();
					};
				})
		);

		this.ws.onclose = () => this.onstatus && this.onstatus('closed');
		this.ws.onmessage = ({ data }) => {
			const signal: Signal = JSON.parse(data);
			this.onsignal && this.onsignal(signal);
		};

		return roomInfo;
	}

	send(signal: Signal) {
		this.ws?.send(JSON.stringify(signal));
	}
}
