import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  data: string;
  title: string;
  description?: string;
  size?: number;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  title,
  description,
  size = 200,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      }
    };

    generateQR();
  }, [data, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success("QR code downloaded successfully!");
    }
  };

  const shareQR = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL();
        const blob = await fetch(dataUrl).then((res) => res.blob());
        const file = new File([blob], `${title}-qr-code.png`, {
          type: "image/png",
        });

        await navigator.share({
          title: title,
          text: description || `QR Code for ${title}`,
          files: [file],
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        toast.success("QR code data copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const parseAndDisplayData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      return (
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 font-mono">
          <div className="mb-2 font-semibold">Code:</div>
          <div className="whitespace-pre-wrap break-all">
            {JSON.stringify(parsed, null, 2)}
          </div>
        </div>
      );
    } catch {
      return (
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 font-mono break-all">
          {jsonData}
        </div>
      );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 text-center">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {parseAndDisplayData(data)}

        <div className="flex gap-2">
          <Button onClick={downloadQR} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={shareQR} variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Scan this QR code at the gate for quick entry
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
