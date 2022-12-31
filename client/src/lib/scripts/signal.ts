interface Signal {
    type: 'sdp' | 'ice-candidate',
    data: object
};

interface RoomInfo {
    polite: boolean,
    has_pair: boolean
}

export class SignalChannel {
    ws: WebSocket;
    onsignal: (signal: Signal) => void;
    status: 'connected' | 'closed';

    async connect(ws: string) {
        this.ws = new WebSocket(ws);

        let roomInfo: RoomInfo;
        await new Promise<void>((resolve, _) => this.ws.onopen = () => {
            this.status = 'connected';
            this.ws.onmessage = ({ data }) => {
                roomInfo = JSON.parse(data);
                resolve();
            };
        });

        this.ws.onclose = () => this.status = 'closed';
        this.ws.onmessage = ({ data }) => {
            const signal: Signal = JSON.parse(data);
            this.onsignal(signal);
        };

        console.log(roomInfo);
        return roomInfo;
    }

    send(signal: Signal) {
        this.ws?.send(JSON.stringify(signal));
    }
}
