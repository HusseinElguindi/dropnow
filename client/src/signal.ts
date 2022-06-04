interface Signal {
    type: 'sdp' | 'ice-candidate',
    data: object
};

export class SignalChannel {
    ws: WebSocket;
    onsignal: (signal: Signal) => void;
    status: 'connected' | 'closed';

    async connect(ws: string) {
        this.ws = new WebSocket(ws);
        await new Promise<void>((resolve, _) => this.ws.onopen = () => {
            this.status = 'connected';
            resolve();
        });
        this.ws.onclose = () => this.status = 'closed';
        this.ws.onmessage = ({ data }) => {
            const signal: Signal = JSON.parse(data);
            this.onsignal(signal);
        };
    }

    send(signal: Signal) {
        this.ws?.send(JSON.stringify(signal));
    }
}
