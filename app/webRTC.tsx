import React, { useEffect, useRef, useState } from 'react';

interface WebrtcComponentProps {
    onHangUp: () => void;
}

const WebrtcComponent: React.FC<WebrtcComponentProps> = ({ onHangUp }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const serverConnectionRef = useRef<WebSocket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    let localStream: MediaStream | null = null;
    let uuid: string | null = null;

    const peerConnectionConfig = {
        iceServers: [
            { urls: 'stun:stun.stunprotocol.org:3478' },
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    };

    useEffect(() => {
        uuid = createUUID();

        if (localVideoRef.current && remoteVideoRef.current) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then(getUserMediaSuccess)
                .catch(errorHandler);

            serverConnectionRef.current = new WebSocket(`wss://${window.location.hostname}:3002`);
            serverConnectionRef.current.onmessage = gotMessageFromServer;

            makeDivDraggable();
        } else {
            alert('Error: Video elements not found');
        }
    }, []);

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = new MediaStream();
        }
    }, []);

    const getUserMediaSuccess = (stream: MediaStream) => {
        localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
    };

    const start = (isCaller: boolean) => {
        setIsCallActive(true);
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
        peerConnectionRef.current.onicecandidate = gotIceCandidate;
        peerConnectionRef.current.ontrack = gotRemoteStream;

        if (localStream) {
            localStream.getTracks().forEach((track) => {
                peerConnectionRef.current!.addTrack(track, localStream!);
            });
        }

        if (isCaller) {
            peerConnectionRef.current
                .createOffer()
                .then(createdDescription)
                .catch(errorHandler);
        }
    };

    const hangup = () => {
        onHangUp();
    };

    const gotMessageFromServer = (message: MessageEvent<any>) => {
        if (!peerConnectionRef.current) {
            start(false);
        }

        const signal = JSON.parse(message.data);

        // Ignore messages from ourselves
        if (signal.uuid === uuid) return;

        if (signal.sdp && peerConnectionRef.current) {
            peerConnectionRef.current
                .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    // Only create answers in response to offers
                    if (signal.sdp.type === 'offer') {
                        peerConnectionRef.current!
                            .createAnswer()
                            .then(createdDescription)
                            .catch(errorHandler);
                    }
                })
                .catch(errorHandler);
        } else if (signal.ice) {
            peerConnectionRef.current!.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
        } else if (signal.hangup) {
            // Hangup signal received, terminate the connection
            hangup();
        }
    };

    const gotIceCandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate != null && serverConnectionRef.current) {
            serverConnectionRef.current.send(JSON.stringify({ ice: event.candidate, uuid }));
        }
    };

    const createdDescription = (description: RTCSessionDescriptionInit) => {
        console.log('got description');

        if (peerConnectionRef.current) {
            peerConnectionRef.current
                .setLocalDescription(description)
                .then(() => {
                    if (serverConnectionRef.current) {
                        serverConnectionRef.current.send(JSON.stringify({ sdp: peerConnectionRef.current!.localDescription, uuid }));
                    }
                })
                .catch(errorHandler);
        }
    };

    const gotRemoteStream = (event: RTCTrackEvent) => {
        console.log('got remote stream');
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    const errorHandler = (error: any) => {
        console.log(error);
    };

    const makeDivDraggable = () => {
        const draggableDiv = document.getElementById('draggableDiv');
        if (draggableDiv) {
            let pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;

            const dragMouseDown = (e: MouseEvent) => {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            };

            const elementDrag = (e: MouseEvent) => {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                const newTop = draggableDiv.offsetTop - pos2;
                const newLeft = draggableDiv.offsetLeft - pos1;

                draggableDiv.style.top = newTop + 'px';
                draggableDiv.style.left = newLeft + 'px';
            };

            const closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };

            draggableDiv.onmousedown = dragMouseDown;
        }
    };

    // Taken from http://stackoverflow.com/a/105074/515584
    // Strictly speaking, it's not a real UUID, but it gets the job done here
    const createUUID = () => {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
    };

    return (
        <div
            id="draggableDiv"
            style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: '200px',
                height: '250px',
                zIndex: 20,
            }}
        >
            <div style={{ position: 'relative', height: '100%' }}>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    controls
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        backgroundColor: !remoteVideoRef.current || !remoteVideoRef.current.srcObject ? 'black' : undefined,
                    }}
                ></video>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '30%',
                        height: '30%',
                        objectFit: 'cover',
                    }}
                ></video>
            </div>

            <div style={{ marginTop: '2px' }}>
                {!isCallActive &&
                    <button onClick={() => start(true)}>Start WebRTC</button>}
            </div>
        </div>
    );
};

export default WebrtcComponent;
