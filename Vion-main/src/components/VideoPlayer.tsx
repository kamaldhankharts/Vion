import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setError('');
    let hls: Hls | null = null;

    if (/\.m3u8(\?|$)/i.test(url) && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError('This stream could not be played.');
      });
    } else {
      video.src = url; // MP4 and Android's built-in HLS
    }
    video.play().catch(() => {});

    return () => {
      if (hls) hls.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay
        playsInline
        onError={() => setError('This video could not be played.')}
      />
      {error && (
        <div className="absolute bottom-24 left-4 right-4 text-center text-sm text-red-200 bg-red-500/20 border border-red-500/40 rounded-xl p-3">
          {error}
        </div>
      )}
    </div>
  );
};
