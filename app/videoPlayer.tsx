import { registerVideoPlayerRef, setVideoPlayerUrl } from './videoPlayerUtils';
import React, { useRef, useEffect, useState, forwardRef, ForwardedRef } from 'react';

type VideoPlayerProps = {
    url: string;
    listener: Function;
};

export type VideoPlayerRef = {
    currentTime: (time: number) => void;
    play: () => void;
    setUrl: (url: string) => void;
};

const VideoPlayer: React.ForwardRefRenderFunction<VideoPlayerRef, VideoPlayerProps> = (
    { url, listener },
    ref
) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [bufferedProgress, setBufferedProgress] = useState<number>(0);

    const currentTime = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const play = () => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    const setUrl = (newUrl: string) => {
        if (videoRef.current) {
            videoRef.current.src = newUrl;
            videoRef.current.load();
            videoRef.current.play();
        }
    };

    useEffect(() => {
        const video = videoRef.current;

        if (video) {
            video.src = url;
            video.load();
            video.play();

            video.addEventListener('progress', () => {
                if (video.buffered.length > 0) {
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                    const duration = video.duration;
                    const progress = (bufferedEnd / duration) * 100;
                    setBufferedProgress(progress);
                }
            });

            video.addEventListener('canplay', () => {
                // video.play();
            });

            video.addEventListener('timeupdate', () => listener(video.currentTime));
        }
    }, [url]);

    useEffect(() => {
        const videoPlayerRef: VideoPlayerRef = {
            currentTime: currentTime,
            play: play,
            setUrl: setUrl
        };

        // Pass the video player reference to the parent component using the ref prop
        if (ref) {
            if (typeof ref === 'function') {
                ref(videoPlayerRef);
            } else {
                ref.current = videoPlayerRef;
            }
        }

        // Register the video player reference for external access
        registerVideoPlayerRef(videoPlayerRef);

        // Cleanup function to remove the reference when the component unmounts
        return () => {
            videoPlayerRef.currentTime = () => { };
            registerVideoPlayerRef(null);
        };
    }, [ref]);

    return (
        <div>
            <video controls ref={videoRef} className="w-full"></video>
        </div>
    );
};

export default forwardRef(VideoPlayer);
