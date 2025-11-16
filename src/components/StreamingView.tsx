import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Activity,
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Loader2,
  Maximize2,
  MonitorPlay,
  Power,
  PowerOff,
  Settings,
  UserCheck,
  Wifi,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface RecognizedFace {
  employee_id: string;
  face_id: string;
  confidence: number;
  timestamp: string;
  location: { x: number; y: number; w: number; h: number };
}

interface StreamStatus {
  is_streaming: boolean;
  active_faces: number;
  recognized_faces: number;
  unknown_faces: number;
  cache_size: number;
  timestamp: string;
}

// API Configuration
const STREAM_API_BASE = 'http://localhost:8002/api/v1/stream';

export function StreamingView() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rtspUrl, setRtspUrl] = useState('rtsp://100.119.206.65:8080/h264_ulaw.sdp');
  const [inputRtspUrl, setInputRtspUrl] = useState('rtsp://100.119.206.65:8080/h264_ulaw.sdp');
  const [recognizedFaces, setRecognizedFaces] = useState<RecognizedFace[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [streamStats, setStreamStats] = useState<StreamStatus | null>(null);
  const [lastFrameUpdate, setLastFrameUpdate] = useState<Date>(new Date());
  const recognitionInterval = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoFeedUrl = `${STREAM_API_BASE}/video_feed?t=${Date.now()}`;

  // Fetch stream status
  const fetchStreamStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${STREAM_API_BASE}/status`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const backendStreaming = data.is_streaming && data.camera_active;
        
        // Detect if backend stopped streaming but frontend thinks it's still running
        if (isStreaming && !backendStreaming) {
          console.warn('Backend stream stopped unexpectedly');
          setIsStreaming(false);
          setVideoError(true);
          toast.error('Stream stopped unexpectedly. Please restart.');
          stopVideoHeartbeat();
        }
        
        setIsStreaming(backendStreaming);
        setStreamStats(data);
        if (data.rtsp_url) {
          setRtspUrl(data.rtsp_url);
          setInputRtspUrl(data.rtsp_url);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Stream status check failed:', error.message);
      }
      // Silently handle network failures for status checks
    }
  };

  // Fetch recognized faces
  const fetchRecognizedFaces = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${STREAM_API_BASE}/recognized_faces?limit=20`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setRecognizedFaces(data.faces || []);
        setLastUpdateTime(new Date());
      } else {
        console.warn('Failed to fetch recognized faces:', response.status);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching recognized faces:', error);
      }
      // Don't show error messages to user for polling failures
    }
  };

  // Start streaming
  const handleStartStream = async () => {
    if (!inputRtspUrl.trim()) {
      toast.error('Please enter a valid RTSP URL');
      return;
    }

    setIsLoading(true);
    setVideoError(false);
    setRetryCount(0);
    
    try {
      console.log('Starting stream with URL:', inputRtspUrl);
      
      const response = await fetch(`${STREAM_API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rtsp_url: inputRtspUrl,
          method: 'opencv' // Use opencv as default, can be changed to 'mediamtx' or 'ffmpeg'
        }),
      });

      const data = await response.json();
      console.log('Stream start response:', data);

      if (response.ok && data.success) {
        setIsStreaming(true);
        setRtspUrl(inputRtspUrl);
        setLastUpdateTime(new Date());
        
        // Wait a moment before updating video feed
        setTimeout(() => {
          if (imgRef.current) {
            imgRef.current.src = `${STREAM_API_BASE}/video_feed?t=${Date.now()}`;
            console.log('Video feed URL updated');
          }
        }, 1000);
        
        startVideoHeartbeat(); // Start monitoring video feed
        
        toast.success(`Stream started successfully with ${data.method || 'opencv'} backend`);
        
        // Start polling for recognized faces with adaptive intervals
        if (recognitionInterval.current) {
          clearInterval(recognitionInterval.current);
        }
        
        // Start with frequent polling, then reduce frequency
        let pollCount = 0;
        const startPolling = () => {
          const poll = () => {
            if (!isStreaming) return;
            
            fetchRecognizedFaces();
            pollCount++;
            
            // After 10 polls (30 seconds), reduce frequency
            if (pollCount > 10) {
              clearInterval(recognitionInterval.current!);
              recognitionInterval.current = setInterval(fetchRecognizedFaces, 5000); // 5 second intervals
            }
          };
          
          recognitionInterval.current = setInterval(poll, 3000); // Start with 3 second intervals
        };
        
        // Delay polling start to let stream stabilize
        setTimeout(startPolling, 2000);
        
      } else {
        console.error('Stream start failed:', data);
        toast.error(data.message || data.error || 'Failed to start stream');
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Unable to connect to streaming service');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop streaming
  const handleStopStream = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${STREAM_API_BASE}/stop`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsStreaming(false);
        setVideoError(false);
        setRetryCount(0);
        stopVideoHeartbeat(); // Stop monitoring
        toast.success('Stream stopped successfully');
        
        // Stop polling for recognized faces
        if (recognitionInterval.current) {
          clearInterval(recognitionInterval.current);
          recognitionInterval.current = null;
        }
      } else {
        toast.error('Failed to stop stream');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Unable to connect to streaming service');
    } finally {
      setIsLoading(false);
    }
  };

  // Download snapshot
  const handleDownloadSnapshot = async () => {
    try {
      const response = await fetch(`${STREAM_API_BASE}/snapshot`);
      if (response.ok) {
        const data = await response.json();
        const link = document.createElement('a');
        link.href = data.image;
        link.download = `snapshot_${new Date().toISOString()}.jpg`;
        link.click();
        toast.success('Snapshot downloaded');
      } else {
        toast.error('Failed to capture snapshot');
      }
    } catch (error) {
      console.error('Error downloading snapshot:', error);
      toast.error('Unable to capture snapshot');
    }
  };

  // Initialize
  useEffect(() => {
    fetchStreamStatus();
    const statusInterval = setInterval(fetchStreamStatus, 10000); // Reduced frequency

    return () => {
      clearInterval(statusInterval);
      if (recognitionInterval.current) {
        clearInterval(recognitionInterval.current);
      }
      stopVideoHeartbeat();
    };
  }, []);

  // Handle video feed errors and retries
  const handleVideoError = () => {
    if (!isStreaming) return;
    
    setVideoError(true);
    setRetryCount(prev => prev + 1);
    
    if (retryCount < 3) {
      // Auto-retry after 2 seconds
      setTimeout(() => {
        if (imgRef.current && isStreaming) {
          imgRef.current.src = `${STREAM_API_BASE}/video_feed?t=${Date.now()}`;
        }
      }, 2000);
    } else {
      toast.error('Video feed connection lost. Please restart the stream.');
    }
  };

  const handleVideoLoad = () => {
    setVideoError(false);
    setRetryCount(0);
    setLastFrameUpdate(new Date());
  };

  // Monitor video feed for stalls
  const startVideoHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    heartbeatInterval.current = setInterval(() => {
      if (!isStreaming) return;
      
      const now = new Date();
      const timeSinceUpdate = now.getTime() - lastFrameUpdate.getTime();
      
      // If no frame update in 10 seconds, treat as stalled
      if (timeSinceUpdate > 10000) {
        console.warn('Video feed appears stalled, attempting refresh');
        handleVideoError();
      }
    }, 5000); // Check every 5 seconds
  };

  const stopVideoHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  // Handle fullscreen exit with ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const totalRecognized = recognizedFaces.length;
  const uniqueEmployees = new Set(recognizedFaces.map(f => f.employee_id)).size;
  const avgConfidence = recognizedFaces.length > 0 
    ? Math.round(recognizedFaces.reduce((sum, f) => sum + f.confidence, 0) / recognizedFaces.length)
    : 0;
  const activeFaces = streamStats?.active_faces || 0;
  const unknownFaces = streamStats?.unknown_faces || 0;

  return (
    <main className="space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10">
              <MonitorPlay className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Live Camera Stream</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Real-time face recognition with AWS Rekognition
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isStreaming && (
            <Button variant="outline" size="sm" onClick={handleDownloadSnapshot} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Snapshot</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </header>

      {/* Summary Statistics */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background p-3 sm:p-4 md:p-6 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Stream Status</p>
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
                    <p className="text-lg sm:text-2xl font-semibold text-green-600">Active</p>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-600">Offline</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="border p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Live Faces</p>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-blue-600">{activeFaces}</p>
              <p className="text-xs text-muted-foreground">Currently visible</p>
            </div>
          </Card>

          <Card className="border p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Recognized</p>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-green-600">{streamStats?.recognized_faces || 0}</p>
              <p className="text-xs text-muted-foreground">Known faces</p>
            </div>
          </Card>

          <Card className="border p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Unknown</p>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-red-600">{unknownFaces}</p>
              <p className="text-xs text-muted-foreground">Unrecognized</p>
            </div>
          </Card>

          <Card className="border p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Confidence</p>
                <CheckCircle2 className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-purple-600">{avgConfidence}%</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stream Control Panel */}
      {!isStreaming && (
        <Card className="border-2 shadow-md">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="rtsp-url" className="text-sm font-medium">RTSP Camera URL</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Enter your camera's RTSP URL (e.g., rtsp://username:password@ip:port/stream)
                </p>
                <Input
                  id="rtsp-url"
                  value={inputRtspUrl}
                  onChange={(e) => setInputRtspUrl(e.target.value)}
                  placeholder="rtsp://admin:password@192.168.1.64:554/stream"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleStartStream} 
                  disabled={isLoading || !inputRtspUrl.trim()}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4" />
                      Start Streaming
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Video Stream */}
      {isStreaming && (
        <Card className="border-2 shadow-md overflow-hidden">
          <div className="relative aspect-video bg-black">
            {videoError && retryCount >= 3 ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                  <p className="text-lg font-semibold mb-2">Video Feed Error</p>
                  <p className="text-sm text-gray-300 mb-4">Connection lost. Please restart the stream.</p>
                  <Button onClick={handleStopStream} variant="outline" size="sm">
                    Restart Stream
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <img 
                  ref={imgRef}
                  src={videoFeedUrl} 
                  alt="Live Camera Feed"
                  className="w-full h-full object-contain"
                  onError={handleVideoError}
                  onLoad={handleVideoLoad}
                />
                
                {videoError && retryCount < 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p className="text-sm">Reconnecting... ({retryCount + 1}/3)</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Top Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <div className="rounded-lg bg-black/80 px-4 py-2 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Main Camera</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-300">
                  <Wifi className="h-3 w-3" />
                  <span>Live</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFullscreen(true);
                  document.body.style.overflow = 'hidden';
                }}
                className="rounded-lg bg-black/80 p-2 backdrop-blur-sm hover:bg-black/90"
              >
                <Maximize2 className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Bottom Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-lg bg-black/80 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                      <span className="text-xs font-semibold text-red-400">RECORDING</span>
                    </div>
                    <span className="text-xs text-gray-300">
                      Last update: {lastUpdateTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopStream}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PowerOff className="h-4 w-4" />
                    )}
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Recognitions */}
      {isStreaming && recognizedFaces.length > 0 && (
        <Card className="border-2 shadow-sm">
          <div className="border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Face Recognitions</h3>
              <Badge variant="secondary" className="gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Live
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {recognizedFaces.slice(0, 10).map((face, index) => (
                <Card key={`${face.face_id}-${index}`} className="border p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarFallback className="bg-linear-to-br from-green-100 to-green-50 text-green-700 font-semibold">
                        {face.employee_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{face.employee_id}</p>
                        <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(face.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 shrink-0">
                      {face.confidence.toFixed(1)}%
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Fullscreen View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-9999 bg-black">
          <div className="relative h-full w-full">
            {videoError && retryCount >= 3 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                  <p className="text-2xl font-semibold mb-2">Video Feed Error</p>
                  <p className="text-lg text-gray-300 mb-4">Connection lost. Please restart the stream.</p>
                  <Button onClick={handleStopStream} variant="outline">
                    Restart Stream
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <img 
                  src={`${STREAM_API_BASE}/video_feed?t=${Date.now()}`}
                  alt="Live Camera Feed"
                  className="w-full h-full object-contain"
                  onError={handleVideoError}
                  onLoad={handleVideoLoad}
                />
                
                {videoError && retryCount < 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                      <p className="text-lg">Reconnecting... ({retryCount + 1}/3)</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Top Overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
              <div className="rounded-xl bg-black/80 px-6 py-4 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">Main Camera - Live Feed</p>
                <div className="mt-2 flex items-center gap-2 text-base text-gray-300">
                  <Wifi className="h-5 w-5" />
                  <span>Active</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  document.body.style.overflow = '';
                }}
                className="rounded-xl bg-black/80 p-4 backdrop-blur-sm hover:bg-black/90"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Bottom Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="rounded-xl bg-black/80 px-8 py-6 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-8 text-white">
                  <div className="text-center">
                    <p className="text-3xl font-semibold text-blue-400">{totalRecognized}</p>
                    <p className="mt-2 text-gray-300">Total Detected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-semibold text-green-400">{uniqueEmployees}</p>
                    <p className="mt-2 text-gray-300">Unique Employees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-semibold text-purple-400">{avgConfidence}%</p>
                    <p className="mt-2 text-gray-300">Avg Confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stream Settings</DialogTitle>
            <DialogDescription>
              Configure your camera stream settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current RTSP URL</Label>
              <Input value={rtspUrl} disabled className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
