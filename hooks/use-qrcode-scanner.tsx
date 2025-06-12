"use client"

import { useState, useRef, useEffect } from "react"
import QrScanner from "qr-scanner"

interface UseQRCodeScannerProps {
  onScan: (result: string) => void
}

export function useQRCodeScanner({ onScan }: UseQRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [hasCamera, setHasCamera] = useState<boolean>(true)

  useEffect(() => {
    QrScanner.hasCamera().then(setHasCamera)

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return

    try {
      setError("")

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScan(result.data)
          stopScanning()
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        },
      )

      await qrScannerRef.current.start()
      setIsScanning(true)
    } catch (err) {
      setError("Falha ao iniciar a câmera. Verifique as permissões.")
      console.error("Erro ao iniciar scanner QR:", err)
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      setIsScanning(false)
    }
  }

  return {
    videoRef,
    isScanning,
    error,
    hasCamera,
    startScanning,
    stopScanning,
  }
}
