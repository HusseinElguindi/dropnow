import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function SendProgressCard({ progress, file, onCancelClick }: { progress: number, file: File | null, onCancelClick?: () => void }) {
  return (
    <>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
        <CardDescription>Track your transfer progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <p>File</p> {file && <Badge variant="outline" className="truncate">{file.name}</Badge>}
        </div>
        <Progress value={progress} max={1} />
        <div>
          <Button variant="outline" className="w-full" onClick={onCancelClick}>Cancel</Button>
        </div>
      </CardContent>
    </>
  )
}
