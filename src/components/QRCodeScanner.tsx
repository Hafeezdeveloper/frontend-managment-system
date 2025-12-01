import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Scan } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
}

const QRCodeScanner = ({
  onScan,
  onError,
  className = "",
  title = "QR Code Scanner",
}: QRCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<
    "idle" | "scanning" | "success" | "error"
  >("idle");
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState<number>(0);
  const [globalLock, setGlobalLock] = useState<boolean>(false);
  const lastScanDataRef = useRef<string>("");
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if camera is available
    const checkCamera = async () => {
      try {
        console.log("🔍 Checking camera availability...");
        const hasCamera = await QrScanner.hasCamera();
        console.log("📷 Camera available:", hasCamera);
        setHasCamera(hasCamera);

        // Also check camera permissions
        if (hasCamera) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            console.log("✅ Camera permissions granted");
            stream.getTracks().forEach((track) => track.stop()); // Stop the test stream
          } catch (permError) {
            console.warn(
              "⚠️ Camera permission denied or not available:",
              permError,
            );
          }
        }
      } catch (error) {
        console.error("❌ Error checking camera:", error);
        setHasCamera(false);
      }
    };

    checkCamera();

    return () => {
      // Cleanup scanner when component unmounts
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
      // Clear any pending timeouts
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) {
      console.error("❌ Cannot start scanning: No video element or camera");
      return;
    }

    try {
      console.log("🚀 Starting QR scanner...");
      setScanStatus("scanning");
      setIsScanning(true);

      // Reset scan count when starting fresh
      setScanCount(0);
      setGlobalLock(false);
      setIsProcessing(false);
      lastScanDataRef.current = "";
      console.log("🟢 Scanner started fresh");

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          const currentTime = Date.now();
          const timeSinceLastScan = currentTime - lastScanTime;

          // ULTRA-AGGRESSIVE PROTECTION: Multiple fail-safes

          // 1. Global lock check
          if (globalLock) {
            console.log("🔒 GLOBAL LOCK ACTIVE - Ignoring scan");
            return;
          }

          // 2. Processing state check
          if (isProcessing) {
            console.log("🔄 PROCESSING ACTIVE - Ignoring scan");
            return;
          }

          // 3. Same data check (exact duplicate)
          if (lastScanDataRef.current === result.data) {
            console.log("📋 EXACT DUPLICATE DATA - Ignoring scan");
            return;
          }

          // 4. Time-based protection (minimum 10 seconds)
          if (timeSinceLastScan < 10000) {
            console.log(
              "⏰ TOO SOON - Ignoring scan:",
              timeSinceLastScan + "ms",
            );
            return;
          }

          // 5. Scan count protection (max 1 scan per session)
          if (scanCount >= 1) {
            console.log("🔢 SCAN LIMIT REACHED - Ignoring scan");
            return;
          }

          // SET ALL LOCKS IMMEDIATELY
          setGlobalLock(true);
          setIsProcessing(true);
          setLastScanTime(currentTime);
          setLastScanResult(result.data);
          setScanStatus("success");
          lastScanDataRef.current = result.data;
          setScanCount((prev) => prev + 1);

          console.log(
            "✅ QR Code scan accepted:",
            result.data.substring(0, 50),
          );

          // Clear any pending timeouts
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }

          // Call the onScan callback ONLY ONCE
          try {
            onScan(result.data);
          } catch (error) {
            console.error("Error in onScan callback:", error);
          }

          // Stop scanner immediately
          stopScanning();

          // Reset all states after extended delay
          scanTimeoutRef.current = setTimeout(() => {
            setIsProcessing(false);
            setGlobalLock(false);
            setScanStatus("idle");
            setScanCount(0);
            lastScanDataRef.current = "";
            console.log("🔓 All locks reset after successful scan");
          }, 15000); // 15 second reset delay
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );

      await scannerRef.current.start();
    } catch (error) {
      console.error("❌ Error starting scanner:", error);
      setScanStatus("error");
      setIsScanning(false);

      let errorMessage = "Failed to start camera";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera permission denied. Please allow camera access and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is being used by another application.";
        } else {
          errorMessage = error.message;
        }
      }

      onError?.(errorMessage);
    }
  };

  const stopScanning = () => {
    console.log("🛑 Stopping scanner and clearing all states");
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScanStatus("idle");

    // Clear timeout if exists
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  };

  const getStatusBadge = () => {
    switch (scanStatus) {
      case "scanning":
        return <Badge className="bg-blue-100 text-blue-800">Scanning...</Badge>;
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success!</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  if (!hasCamera) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CameraOff className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CameraOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Camera Not Available</p>
            <p className="text-sm text-gray-500 mb-4">
              Please follow these steps to enable camera access:
            </p>
            <div className="text-left bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-2">Troubleshooting Steps:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Check if your device has a camera</li>
                <li>Allow camera permissions when prompted</li>
                <li>Ensure no other apps are using the camera</li>
                <li>Try refreshing the page</li>
                <li>Check browser settings for camera access</li>
              </ul>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Retry Camera Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Scan className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              style={{ display: isScanning ? "block" : "none" }}
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">
                    Click start to begin scanning
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-2">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline">
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Last Scan Result */}
          {lastScanResult && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">
                Last Scanned:
              </p>
              <p className="text-xs font-mono text-green-700 break-all">
                {lastScanResult}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-gray-500">
            <p>Position the QR code within the camera view</p>
            <p>The scanner will automatically detect and process the code</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
