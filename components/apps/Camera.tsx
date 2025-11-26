
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AppProps } from '../../types';
import { Camera as CameraIcon, Video, RefreshCw, AlertCircle, Download, Trash2, Film, Circle, Square, Palette, ScanFace, X } from 'lucide-react';

const FILTERS = [
  { name: 'Normal', class: '' },
  { name: 'B&W', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Invert', class: 'invert' },
  { name: 'Contrast', class: 'contrast-125' },
  { name: 'Cyber', class: 'hue-rotate-90 contrast-125 saturate-150' },
  { name: 'Matrix', class: 'sepia hue-rotate-90 contrast-125' },
];

const Camera: React.FC<AppProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captures, setCaptures] = useState<{type: 'photo'|'video', url: string}[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // New Features State
  const [faceTrackEnabled, setFaceTrackEnabled] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Access denied. Please allow camera/mic permissions.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera device found.");
      } else {
        setError("Unable to access camera. " + err.message);
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer for recording
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isRecording) {
          interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      } else {
          setRecordingTime(0);
      }
      return () => clearInterval(interval);
  }, [isRecording]);

  const takePhoto = () => {
    if (videoRef.current && !error) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 100);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply current filter to canvas for saving
        if (activeFilter !== 0) {
            ctx.filter = getComputedStyle(videoRef.current).filter;
        }
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setCaptures(prev => [{type: 'photo', url: dataUrl}, ...prev]);
      }
    }
  };

  const startRecording = () => {
      if (!stream) return;
      const options = { mimeType: 'video/webm' };
      try {
        const mediaRecorder = new MediaRecorder(stream, options);
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setCaptures(prev => [{type: 'video', url}, ...prev]);
        };
        
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (e) {
        console.error("MediaRecorder error:", e);
        setError("Video recording not supported in this browser.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const toggleRecord = () => {
      if (isRecording) stopRecording();
      else startRecording();
  };

  const downloadCapture = (url: string, type: 'photo'|'video') => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `capture-${Date.now()}.${type === 'photo' ? 'png' : 'webm'}`;
      a.click();
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full bg-black relative overflow-hidden select-none group">
      
      {/* Video Layer */}
      {error ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#111]">
            <div className="text-gray-500 flex flex-col items-center gap-4 p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                    <AlertCircle size={32} className="text-red-500" />
                </div>
                <div className="max-w-xs">
                    <h3 className="text-white font-bold mb-1">Camera Error</h3>
                    <p className="text-sm mb-4">{error}</p>
                    <button 
                        onClick={startCamera}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm flex items-center gap-2 mx-auto transition-colors"
                    >
                        <RefreshCw size={14} /> Retry Access
                    </button>
                </div>
            </div>
          </div>
      ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${FILTERS[activeFilter].class}`}
          />
      )}

      {/* Face Tracking Overlay */}
      {faceTrackEnabled && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-64 h-64 border-2 border-yellow-400/70 relative animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-yellow-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-yellow-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-yellow-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-yellow-400"></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400/20 text-yellow-400 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest border border-yellow-400/50 backdrop-blur-sm">
                      FACE DETECTED
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
          </div>
      )}

      {/* Flash Effect */}
      {isFlashing && <div className="absolute inset-0 bg-white animate-out fade-out duration-200 z-50"></div>}

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => setFaceTrackEnabled(!faceTrackEnabled)}
            className={`p-2 rounded-full backdrop-blur-md border transition-colors ${faceTrackEnabled ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-black/30 border-white/20 text-white hover:bg-black/50'}`}
            title="Toggle Face Tracking"
          >
              <ScanFace size={20} />
          </button>
          
          {isRecording && (
             <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full animate-pulse shadow-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-mono font-bold">{formatTime(recordingTime)}</span>
             </div>
          )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end pb-6 z-20 px-8">
         
         {/* Filter Bar (Conditional) */}
         {showFilters && (
             <div className="flex gap-3 overflow-x-auto pb-4 mb-2 no-scrollbar animate-in slide-in-from-bottom-4 fade-in duration-200 justify-center">
                 {FILTERS.map((f, i) => (
                     <button 
                        key={f.name}
                        onClick={() => setActiveFilter(i)}
                        className={`flex flex-col items-center gap-1 flex-shrink-0 ${activeFilter === i ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                     >
                         <div className={`w-12 h-12 rounded-full border-2 overflow-hidden ${activeFilter === i ? 'border-yellow-400' : 'border-gray-600'}`}>
                             {/* Preview circle (just uses color for sim) */}
                             <div className={`w-full h-full bg-gray-500 ${f.class}`} style={{ backgroundImage: 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)', backgroundSize: '20px 20px' }}></div>
                         </div>
                         <span className="text-[10px] font-medium shadow-black drop-shadow-md">{f.name}</span>
                     </button>
                 ))}
             </div>
         )}

         <div className="flex items-center justify-between relative">
             {/* Gallery Thumbnail */}
             <div className="w-16 flex justify-center">
                 {captures.length > 0 ? (
                     <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white cursor-pointer relative group/thumb shadow-lg">
                         {captures[0].type === 'video' ? (
                             <video src={captures[0].url} className="w-full h-full object-cover" />
                         ) : (
                             <img src={captures[0].url} alt="Last" className="w-full h-full object-cover" />
                         )}
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                             <Download size={16} className="text-white" onClick={(e) => { e.stopPropagation(); downloadCapture(captures[0].url, captures[0].type); }}/>
                         </div>
                     </div>
                 ) : (
                     <div className="w-12 h-12 rounded-lg bg-white/10 border-2 border-white/30 flex items-center justify-center">
                         <Film size={20} className="text-white/50" />
                     </div>
                 )}
             </div>

             {/* Shutter Button */}
             <div className="flex flex-col items-center gap-4 relative -top-2">
                 <button 
                    onClick={mode === 'photo' ? takePhoto : toggleRecord}
                    disabled={!!error}
                    className={`
                        w-16 h-16 rounded-full border-[4px] flex items-center justify-center transition-all active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)]
                        ${error ? 'border-gray-600 opacity-50 cursor-not-allowed' : 'border-white hover:bg-white/20 cursor-pointer'}
                    `}
                 >
                     <div className={`
                        rounded-full transition-all duration-300
                        ${mode === 'photo' ? 'w-14 h-14 bg-white' : (isRecording ? 'w-6 h-6 rounded-sm bg-red-500 animate-pulse' : 'w-14 h-14 bg-red-500')}
                     `}></div>
                 </button>
                 
                 {/* Mode Toggles */}
                 <div className="flex gap-6 bg-black/50 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                     <button 
                        onClick={() => { setMode('photo'); setIsRecording(false); }}
                        className={`text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'photo' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                     >
                         Photo
                     </button>
                     <button 
                        onClick={() => setMode('video')}
                        className={`text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'video' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                     >
                         Video
                     </button>
                 </div>
             </div>

             {/* Filter Toggle */}
             <div className="w-16 flex justify-center">
                 <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all ${showFilters ? 'bg-white text-black border-white' : 'bg-black/30 text-white border-white/20 hover:bg-black/50'}`}
                 >
                     {showFilters ? <X size={20} /> : <Palette size={20} />}
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Camera;
