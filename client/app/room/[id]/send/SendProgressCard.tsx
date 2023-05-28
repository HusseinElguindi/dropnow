import { Send } from "lucide-react"
import { ChangeEvent, Ref, useState } from "react"

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function SendProgressCard({ file, onCancelClick }: { file: File | null, onCancelClick?: () => void }) {
  return (
    <>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <p>File</p> {file && <Badge variant="outline" className="truncate">{file.name}</Badge>}
        </div>
        <Progress value={30} max={100} />
        <Progress value={30} max={100} />
        <Progress value={30} max={100} />
        <Progress value={30} max={100} />
        <Progress value={30} max={100} />
        <div>
          <Button variant="outline" className="w-full" onClick={onCancelClick}>Cancel</Button>
        </div>
      </CardContent>
    </>
  )
}
