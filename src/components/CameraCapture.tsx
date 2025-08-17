import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { showError } from '@/utils/toast';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        showError("Could not access the camera. Please check permissions.");
        onClose();
      }
    };

    getCameraStream();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onClose, stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${new Date().toISOString()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center items-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 text-white hover:bg-white/20 hover:text-white"
          onClick={onClose}
        >
          <X className="h-8 w-8" />
        </Button>
        <Button
          size="icon"
          className="w-20 h-20 rounded-full bg-white text-black hover:bg-gray-200"
          onClick={handleCapture}
          aria-label="Capture photo"
        >
          <Camera className="h-10 w-10" />
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;