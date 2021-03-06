import type { SignalChannel } from './signal';

export class PeerConnection {
    signalChannel: SignalChannel;
    pc: RTCPeerConnection;

    polite: boolean;
    state: {
        makingOffer: boolean,
        ignoreOffer: boolean,
        isSettingRemoteAnswerPending: boolean
    };

    async negotiate(that: PeerConnection) {
        console.log(that.state);
        try {
            that.state.makingOffer = true;
            await that.pc.setLocalDescription();
            that.signalChannel.send({ type: 'sdp', data: that.pc.localDescription });
        }
        catch (err) {
            console.error(err);
        }
        finally {
            that.state.makingOffer = false;
        }
        
        // temp
        this.pc.onnegotiationneeded = async () => {
            try {
                that.state.makingOffer = true;
                await that.pc.setLocalDescription();
                that.signalChannel.send({ type: 'sdp', data: that.pc.localDescription });
            }
            catch (err) {
                console.error(err);
            }
            finally {
                that.state.makingOffer = false;
            }
        };
    }

    constructor(sc: SignalChannel, polite: boolean) {
        this.signalChannel = sc;
        this.polite = polite;

        const configuration = { 
            iceServers: [{ 
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] 
            }] 
        };
        this.pc = new RTCPeerConnection(configuration);

        console.log(this.state);
        // Keep track of some negotiation state to prevent races and errors
        this.state = {
            makingOffer: false,
            ignoreOffer: false,
            isSettingRemoteAnswerPending: false
        };
        console.log(this.state);

        // Send any ice candidates to the other peer
        this.pc.onicecandidate = ({ candidate }) => this.signalChannel.send({ 
            type: 'ice-candidate', 
            data: candidate 
        });

        // Let the "negotiationneeded" event trigger offer generation
        // this.pc.onnegotiationneeded = async () => {
            // try {
                // this.state.makingOffer = true;
                // await this.pc.setLocalDescription();
                // this.signalChannel.send({ type: 'sdp', data: this.pc.localDescription });
            // }
            // catch (err) {
                // console.error(err);
            // }
            // finally {
                // this.state.makingOffer = false;
            // }
        // };

        // this.pc.onnegotiationneeded = this.negotiate;

        // this.signalChannel.onmessage = async ({data: {description, candidate}}) => {
        this.signalChannel.onsignal = async ({ type, data }) => {
            try {
                if (type == 'sdp') {
                    let description = data as RTCSessionDescription;
                    // An offer may come in while we are busy processing SRD(answer).
                    // In this case, we will be in "stable" by the time the offer is processed
                    // so it is safe to chain it on our Operations Chain now.
                    const readyForOffer = !this.state.makingOffer && (this.pc.signalingState == "stable" || this.state.isSettingRemoteAnswerPending);
                    const offerCollision = description.type == "offer" && !readyForOffer;

                    this.state.ignoreOffer = !this.polite && offerCollision;
                    if (this.state.ignoreOffer) {
                        return;
                    }
                    this.state.isSettingRemoteAnswerPending = description.type == "answer";
                    await this.pc.setRemoteDescription(description); // SRD rolls back as needed
                    this.state.isSettingRemoteAnswerPending = false;
                    if (description.type == "offer") {
                        await this.pc.setLocalDescription();
                        this.signalChannel.send({ type: 'sdp', data: this.pc.localDescription });
                    }
                }
                else if (type == 'ice-candidate') {
                    let candidate = data as RTCIceCandidate;
                    try {
                        await this.pc.addIceCandidate(candidate);
                    }
                    catch (err) {
                        if (!this.state.ignoreOffer) throw err; // Suppress ignored offer's candidates
                    }
                }
            } 
            catch (err) {
                console.error(err);
            }
        }
    }

}
