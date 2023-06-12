"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import {
  DownloadObj,
  createPeerConnection,
  createSignalChannel,
} from "./Connections"
import SendFormCard from "./send/SendFormCard"
import SendProgressCard from "./send/SendProgressCard"

export default function Page({ params: { id } }: { params: { id: string } }) {
  const [InFile, setInFile] = useState<File | null>(null)
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInFile(e.target.files && e.target.files[0])

  const [sendClicked, setSendClicked] = useState(false)
  const [{ sendFile }, setSendFile] = useState<{ sendFile: (_: File) => void }>(
    { sendFile: (_) => { } }
  )

  const handleSendClick = () => {
    setSendClicked(true)
    console.log({ sendFile })
    InFile && sendFile(InFile)
  }

  const downloadAnchor = useRef<HTMLAnchorElement>(null)

  const [signalChannelStatus, setSignalChannelStatus] = useState<
    "connected" | "closed"
  >()
  const [peerConnectionStatus, setPeerConnectionStatus] =
    useState<RTCPeerConnectionState>()

  const [signalChannelStatusColor, setSignalChannelStatusColor] =
    useState("bg-red-500")
  useEffect(() => {
    switch (signalChannelStatus) {
      case "connected":
        setSignalChannelStatusColor("bg-green-500")
        break
      case "closed":
        setSignalChannelStatusColor("bg-red-500")
        break
    }
  }, [signalChannelStatus])

  const [peerConnectionStatusColor, setPeerConnectionStatusColor] =
    useState("bg-red-500")
  useEffect(() => {
    switch (peerConnectionStatus) {
      case "connected":
        setPeerConnectionStatusColor("bg-green-500")
        break
      case "connecting":
        setPeerConnectionStatusColor("bg-amber-500")
        break
      default:
        setPeerConnectionStatusColor("bg-red-500")
        break
    }
  }, [peerConnectionStatus])

  const [downloadProgress, setDownloadProgress] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDownloadObj = (obj: DownloadObj) => {
    if (!downloadAnchor.current) {
      return
    }
    downloadAnchor.current.href = obj.URL
    downloadAnchor.current.download = obj.filename
    downloadAnchor.current.click()
  }

  useEffect(() => {
    ; (async () => {
      const wsProtocol = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
      const host = process.env.NODE_ENV == 'production' ? window.location.host : 'localhost:3001';
      const URL = `${wsProtocol}//${host}/ws/${id}`
      const { sc, roomInfo } = await createSignalChannel(URL)
      setSignalChannelStatus(sc.status) // TODO: better state system

      const sendFileFn = await createPeerConnection({
        sc,
        roomInfo,
        handleDownloadProgress: (p) => setDownloadProgress(p),
        handleUploadProgress: (p) => setUploadProgress(p),
        handleDownloadObj,
        handleStatus: (s) => setPeerConnectionStatus(s),
      })
      setSendFile({ sendFile: sendFileFn })
    })()
  }, [id])

  return (
    <section className="container items-center space-y-4 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <div className="flex gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tighter">
            Room
          </h1>
          <Badge variant="outline" className="text-2xl md:text-3xl">
            {id}
          </Badge>
        </div>
      </div>

      <Card className="max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge
              className={cn(
                "w-fit pointer-events-none",
                signalChannelStatusColor
              )}
            >
              Signal Server
            </Badge>
            <Badge
              className={cn(
                "w-fit pointer-events-none",
                peerConnectionStatusColor
              )}
            >
              Peer-to-Peer
            </Badge>
          </div>
        </CardContent>
      </Card>

      {peerConnectionStatus == "connected" ? (
        <>
          <Card className="max-w-sm">
            {!sendClicked ? (
              <SendFormCard
                onFileChange={onChange}
                onSendClick={handleSendClick}
              />
            ) : (
              <SendProgressCard
                progress={uploadProgress}
                file={InFile}
                done={uploadProgress === 1}
                onCancelClick={() => setSendClicked(false)}
              />
            )}
          </Card>

          <Card className="max-w-sm">
            <CardHeader className="pb-4">
              <CardTitle>Receive</CardTitle>
              <CardDescription>Track your receiving progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={downloadProgress * 100} max={100} />
            </CardContent>
            <a
              ref={downloadAnchor}
              hidden
              target="_blank"
              referrerPolicy="no-referrer"
            >
              Download
            </a>
          </Card>
        </>
      ) : (
        <>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Waiting for peer.</CardTitle>
            </CardHeader>
          </Card>
        </>
      )}
    </section>
  )
}
