import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"


export default function SendProgressCard({ progress, file, onCancelClick, done }: { progress: number, file: File | null, onCancelClick?: () => void, done: boolean }) {
  return (
    <>
      <CardHeader>
        <CardTitle>Send</CardTitle>
        <CardDescription>Track your sending progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <p>File</p> {file && <Badge variant="outline" className="truncate">{file.name}</Badge>}
        </div>
        <Progress value={progress*100} max={100} />
        <div>
          <Button variant="outline" className="w-full" onClick={onCancelClick}>{done ? "Send another file" : "Cancel"}</Button>
        </div>
      </CardContent>
    </>
  )
}

