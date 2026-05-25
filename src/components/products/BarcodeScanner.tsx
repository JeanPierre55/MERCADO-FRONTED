import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import { Exception } from '@zxing/library'

interface BarcodeScannerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (barcode: string) => void
  onCameraError?: (message: string) => void
}

export default function BarcodeScanner({ value, onChange, onSubmit, onCameraError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRequestRef = useRef<number | null>(null)
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const zxingControlsRef = useRef<IScannerControls | null>(null)
  const isScanningRef = useRef(false)
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false)
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [cameraMessage, setCameraMessage] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim())
    }
  }

  const getEnvironmentCameraError = async () => {
    if (!window.isSecureContext) {
      return 'La camara requiere un contexto seguro. Usa HTTPS o abre la app desde localhost.'
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'Tu navegador no expone la API de camara (mediaDevices). Prueba con Chrome, Edge o Firefox actualizados.'
    }

    const policySource = (document as Document & {
      permissionsPolicy?: { allowsFeature: (feature: string) => boolean }
      featurePolicy?: { allowsFeature: (feature: string) => boolean }
    })
    const policy = policySource.permissionsPolicy || policySource.featurePolicy
    if (policy?.allowsFeature && !policy.allowsFeature('camera')) {
      return 'La politica de permisos de este entorno bloquea la camara. Abre la app en una pestana normal del navegador.'
    }

    try {
      if (navigator.permissions?.query) {
        const status = await navigator.permissions.query({ name: 'camera' as PermissionName })
        if (status.state === 'denied') {
          return 'Permiso de camara denegado en el navegador. Habilitalo para localhost:3000 y recarga la pagina.'
        }
      }
    } catch {
      // Algunos navegadores no soportan query('camera'): se ignora y se continua.
    }

    return null
  }

  const getReadableCameraError = (error: unknown) => {
    const origin = `${window.location.protocol}//${window.location.host}`
    const secureText = window.isSecureContext ? 'si' : 'no'
    const fallback = `No se pudo iniciar escaneo por camara. Contexto: ${origin} (secureContext: ${secureText}).`

    const asError = error as { name?: string; message?: string } | undefined
    const name = asError?.name || ''
    const message = (asError?.message || '').toLowerCase()

    if (message.includes('permission') || message.includes('denied')) {
      return 'Permiso de camara denegado o bloqueado. Habilitalo en el navegador y recarga la pagina.'
    }
    if (message.includes('secure') || message.includes('insecure') || message.includes('https')) {
      return 'La camara requiere contexto seguro. Abre la app por HTTPS o localhost.'
    }
    if (message.includes('notfound') || message.includes('no camera') || message.includes('devices not found')) {
      return 'No se detecto ninguna camara disponible en este dispositivo.'
    }
    if (message.includes('notreadable') || message.includes('trackstart') || message.includes('could not start video source')) {
      return 'La camara esta ocupada por otra app (Zoom, Meet, Teams, etc). Cierra esa app e intenta de nuevo.'
    }

    switch (name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Permiso de camara denegado o bloqueado. Habilitalo en el navegador y recarga la pagina.'
      case 'NotFoundError':
        return 'No se detecto ninguna camara disponible en este dispositivo.'
      case 'NotReadableError':
      case 'TrackStartError':
        return 'La camara esta en uso por otra aplicacion o bloqueada por el sistema operativo.'
      case 'OverconstrainedError':
        return 'No se encontro una configuracion de camara compatible para este escaneo.'
      case 'AbortError':
        return 'El navegador interrumpio el acceso a la camara. Intenta nuevamente.'
      case 'TypeError':
        return 'No fue posible abrir la camara en este contexto. Usa HTTPS o localhost.'
      default:
        return `${fallback} Error tecnico: ${name || 'desconocido'}${asError?.message ? ` - ${asError.message}` : ''}`
    }
  }

  const stopCamera = () => {
    if (zxingControlsRef.current) {
      zxingControlsRef.current.stop()
      zxingControlsRef.current = null
    }

    if (zxingReaderRef.current) {
      zxingReaderRef.current = null
    }

    if (frameRequestRef.current !== null) {
      cancelAnimationFrame(frameRequestRef.current)
      frameRequestRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    isScanningRef.current = false
  }

  const isIgnorableScanError = (error: Exception | undefined) => {
    if (!error) return true
    const name = error.name || ''
    return (
      name.includes('NotFoundException') ||
      name.includes('ChecksumException') ||
      name.includes('FormatException')
    )
  }

  const startZxingScanner = async () => {
    if (!videoRef.current) {
      throw new Error('Video no disponible')
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
    streamRef.current = stream

    const reader = new BrowserMultiFormatReader()
    zxingReaderRef.current = reader

    const controls = await reader.decodeFromStream(
      stream,
      videoRef.current,
      (result, error, controlsRef) => {
        if (!isScanningRef.current) {
          return
        }

        if (result) {
          const code = result.getText().trim()
          if (!code) {
            return
          }

          onChange(code)
          onSubmit(code)
          controlsRef.stop()
          handleCloseCameraDialog()
          return
        }

        if (error && !isIgnorableScanError(error)) {
          const friendlyMessage = 'Error de lectura en tiempo real. Vuelve a intentar con mejor iluminacion.'
          setCameraState('error')
          setCameraMessage(friendlyMessage)
          onCameraError?.(friendlyMessage)
          controlsRef.stop()
          zxingControlsRef.current = null
          isScanningRef.current = false
        }
      }
    )

    zxingControlsRef.current = controls
    setCameraState('scanning')
    setCameraMessage('Apunta el codigo de barras al centro de la camara')
  }

  const startCameraScanner = async () => {
    const environmentError = await getEnvironmentCameraError()
    if (environmentError) {
      setCameraState('error')
      setCameraMessage(environmentError)
      onCameraError?.(environmentError)
      return
    }

    setCameraState('starting')
    setCameraMessage('Inicializando camara...')

    try {
      isScanningRef.current = true
      await startZxingScanner()
      setCameraState('scanning')
      setCameraMessage('Apunta el codigo de barras al centro de la camara')
    } catch (error) {
      stopCamera()
      const friendlyMessage = getReadableCameraError(error)
      console.error('Camera scanner init error:', error)
      setCameraState('error')
      setCameraMessage(friendlyMessage)
      onCameraError?.(friendlyMessage)
    }
  }

  const handleCloseCameraDialog = () => {
    stopCamera()
    setIsCameraDialogOpen(false)
    setCameraState('idle')
    setCameraMessage('')
  }

  useEffect(() => {
    if (!isCameraDialogOpen) {
      return
    }

    void startCameraScanner()
    return () => stopCamera()
  }, [isCameraDialogOpen])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <>
      <div
        className="flex align-items-center gap-2 px-4"
        style={{
          backgroundColor: 'var(--pos-bg-tertiary)',
          borderRadius: '10px',
          height: '52px',
          border: '1.5px solid var(--pos-border)',
        }}
      >
        <i
          className="pi pi-barcode"
          style={{ color: 'var(--pos-text-muted)', fontSize: '1.1rem' }}
        />
        <InputText
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Codigo de barras"
          className="border-none"
          style={{
            backgroundColor: 'transparent',
            width: '160px',
            padding: '0',
            fontSize: '0.95rem',
          }}
        />
        <Button
          icon="pi pi-camera"
          text
          rounded
          aria-label="Escanear con camara"
          onClick={() => setIsCameraDialogOpen(true)}
          style={{ color: 'var(--pos-text-secondary)', width: '2rem', height: '2rem' }}
        />
      </div>

      <Dialog
        visible={isCameraDialogOpen}
        onHide={handleCloseCameraDialog}
        header="Escanear codigo de barras"
        style={{ width: '520px', maxWidth: '92vw' }}
        modal
      >
        <div className="flex flex-column gap-3">
          <div
            style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#111827',
              aspectRatio: '4 / 3',
              position: 'relative',
            }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {cameraState === 'starting' && (
              <div
                className="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center"
                style={{ background: 'rgba(0, 0, 0, 0.35)', color: 'white' }}
              >
                Iniciando camara...
              </div>
            )}
          </div>

          {cameraMessage && (
            <p className="m-0 text-sm" style={{ color: 'var(--pos-text-secondary)' }}>
              {cameraMessage}
            </p>
          )}

          <div className="flex justify-content-end">
            <Button
              label={cameraState === 'error' ? 'Cerrar' : 'Cancelar'}
              onClick={handleCloseCameraDialog}
              className="p-button-outlined"
            />
          </div>
        </div>
      </Dialog>
    </>
  )
}
