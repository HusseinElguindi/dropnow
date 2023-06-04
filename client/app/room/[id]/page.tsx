"use client"
import { ChangeEvent, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import SendFormCard from "./send/SendFormCard"
import SendProgressCard from "./send/SendProgressCard"


export default function Page({ params: { id } }: { params: { id: string } }) {
  const [InFile, setInFile] = useState<File | null>(null)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setInFile(e.target.files && e.target.files[0])

  const [sendClicked, setSendClicked] = useState(false);

  return (
    <section className="container grid items-center gap-4 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <div className="flex gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tighter">
            Room
          </h1>
          <Badge variant="outline" className="text-2xl md:text-3xl">{id}</Badge>
        </div>
      </div>
      <Card className="max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge className="w-fit">Websocket</Badge>
            <Badge className="w-fit">Peer-to-Peer</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="relative max-w-sm overflow-hidden overflow-y-hidden transition-[height] ease-in-out duration-300">
          {!sendClicked
              ? <SendFormCard onFileChange={onChange} onSendClick={() => setSendClicked(true)} />
              : <SendProgressCard progress={20} file={InFile} onCancelClick={() => setSendClicked(false)} />
          }
      </Card>
    </section>
  )
}
