import { VideoPlayerRef } from './videoPlayer';

let videoPlayerRef: VideoPlayerRef | null = null;

export const setVideoPlayerUrl = (url: string) => {
    if (videoPlayerRef) {
        videoPlayerRef.setUrl(url);
    }
};

export const registerVideoPlayerRef = (ref: VideoPlayerRef | null) => {
    videoPlayerRef = ref;
};
