import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const isRecodingSupported =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function'

type RoomParams = {
  roomId: string
}

export function RecordRoomAudio() {
  const params = useParams<RoomParams>()

  const [isRecoding, setIsRecording] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  async function uploadAudio(audio: Blob) {
    const formData = new FormData()

    formData.append('file', audio, 'audio.webm')

    const response = await fetch(
      `http://localhost:3333/rooms/${params.roomId}/audio`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const result = response.json()

    // biome-ignore lint/suspicious/noConsole: This is for debugging purposes
    console.log(result)
  }

  function stopRecording() {
    setIsRecording(false)

    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop()
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function createRecorder(audio: MediaStream) {
    recorder.current = new MediaRecorder(audio, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64_000,
    })

    recorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        uploadAudio(event.data)
      }
    }

    recorder.current.onstart = () => {
      // biome-ignore lint/suspicious/noConsole: This is for debugging purposes
      console.log('Gravação iniciada')
    }

    recorder.current.onstop = () => {
      // biome-ignore lint/suspicious/noConsole: This is for debugging purposes
      console.log('Gravação encerrada/pausada')
    }

    recorder.current.start()
  }

  async function startRecording() {
    if (!isRecodingSupported) {
      alert('Gravação de áudio não é suportada neste navegador.')
      return
    }

    setIsRecording(true)

    const audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44_100,
      },
    })

    createRecorder(audio)

    intervalRef.current = setInterval(() => {
      recorder.current?.stop()

      createRecorder(audio)
    }, 5000)
  }

  if (!params.roomId) {
    return <Navigate replace to="/" />
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      {isRecoding ? (
        <Button onClick={stopRecording}>Para gravação</Button>
      ) : (
        <Button onClick={startRecording}>Gravar áudio</Button>
      )}
      {isRecoding ? <p>Gravando...</p> : <p>Pausado</p>}
    </div>
  )
}
