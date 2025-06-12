"use client"

import { useEffect, useRef, useState } from "react"
import QrScanner from "qr-scanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Copy, CheckCircle } from "lucide-react"

export default function QRCodeReader() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [hasCamera, setHasCamera] = useState<boolean>(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if camera is available
    QrScanner.hasCamera().then(setHasCamera)

    return () => {
      // Cleanup scanner on unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return

    try {
      setError("")

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setScannedData(result.data)
          // Optionally stop scanning after first successful scan
          // stopScanning()
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment", // Use back camera on mobile
        },
      )

      await qrScannerRef.current.start()
      setIsScanning(true)
    } catch (err) {
      setError("Failed to start camera. Please ensure you have granted camera permissions.")
      console.error("Error starting QR scanner:", err)
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      setIsScanning(false)
    }
  }

  const copyToClipboard = async () => {
    if (scannedData) {
      try {
        await navigator.clipboard.writeText(scannedData)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy to clipboard:", err)
      }
    }
  }

  const clearResult = () => {
    setScannedData("")
    setCopied(false)
  }

  if (!hasCamera) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CameraOff className="w-5 h-5" />
              No Camera Available
            </CardTitle>
            <CardDescription>
              No camera was detected on this device. Please ensure you have a working camera connected.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">Use your webcam to scan QR codes instantly</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Feed
            </CardTitle>
            <CardDescription>Position the QR code within the camera view to scan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" playsInline muted />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <p className="text-white text-sm">Camera preview will appear here</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="flex-1">
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {scannedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scanned Result</span>
                <Badge variant="secondary">Success</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg break-all">
                <p className="font-mono text-sm"></p>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button onClick={clearResult} variant="outline">
                  Clear
                </Button>
              </div>

              {/* Auto-detect and render different types of QR content */}
              {scannedData.startsWith("http") && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Detected URL:</p>
                  <Button asChild variant="outline" size="sm">
                    <a href={scannedData} target="_blank" rel="noopener noreferrer">
                      Open Link
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Click "Start Scanning" to activate your camera</p>
            <p>2. Allow camera permissions when prompted</p>
            <p>3. Point your camera at a QR code</p>
            <p>4. The result will appear automatically when detected</p>
            <p>5. Use "Copy to Clipboard" to copy the scanned data</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
