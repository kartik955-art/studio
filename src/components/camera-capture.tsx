'use client';

import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertTitle, AlertDescription} from '@/components/ui/alert';
import {Camera} from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUri: string) => void;
}

export function CameraCapture({onCapture}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const {toast} = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        onCapture(dataUri);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full relative">
        <video
          ref={videoRef}
          className="w-full aspect-video rounded-md bg-muted"
          autoPlay
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
            <Alert variant="destructive" className="max-w-sm">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser to use this feature.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <Button
        onClick={handleCapture}
        disabled={!hasCameraPermission}
        size="lg"
      >
        <Camera className="mr-2 h-5 w-5" />
        Capture Photo
      </Button>
    </div>
  );
}
