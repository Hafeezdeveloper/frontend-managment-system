import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle } from "lucide-react";

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator = ({
  data,
  title = "QR Code",
  size = 200,
  className = "",
}: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current && data) {
        try {
          await QRCode.toCanvas(canvasRef.current, data, {
            width: size,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });

          // Also generate data URL for download
          const dataURL = await QRCode.toDataURL(data, {
            width: size,
            margin: 2,
          });
          setQrCodeDataURL(dataURL);
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      }
    };

    generateQR();
  }, [data, size]);

  const handleDownload = () => {
    if (qrCodeDataURL) {
      const link = document.createElement("a");
      link.href = qrCodeDataURL;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyCode = async () => {
    try {
      // Check if clipboard API is available and secure context
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback method for non-secure contexts or when clipboard API is blocked
        const textArea = document.createElement("textarea");
        textArea.value = data;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            throw new Error("Copy command failed");
          }
        } catch (fallbackError) {
          console.error("Fallback copy failed:", fallbackError);
          // Show user the code to copy manually
          alert(`Please copy this code manually:\n\n${data}`);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      // Final fallback - show the code to user
      alert(`Copy failed. Please copy this code manually:\n\n${data}`);
    }
  };

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data to generate QR code</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <canvas ref={canvasRef} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Code:</p>
          <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all max-w-xs">
            {data}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="flex items-center"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 mr-1" />
            )}
            {copied ? "Copied!" : "Copy Code"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
