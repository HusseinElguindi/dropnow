import { Send } from "lucide-react"
import { ChangeEvent, useState } from "react"

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SendFormCard({ onFileChange, onSendClick }: { onFileChange?: (e: ChangeEvent<HTMLInputElement>) => void, onSendClick?: () => void }) {
  const [InFile, setInFile] = useState<File | null>(null)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInFile(e.target.files && e.target.files[0])
    onFileChange && onFileChange(e)
  }

  const onClick = () => {
    onSendClick && onSendClick();
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Send</CardTitle>
        <CardDescription>Select a file to send</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="file" multiple={false} onChange={onChange} />
          {/*<Button className="w-full gap-1" onClick={onClick}>*/}
          <Button className="w-full gap-1" disabled={!InFile} onClick={onClick}>
          <Send className="mr-2 h-3 w-3" />Send
        </Button>
      </CardContent>
    </>
  )
}
