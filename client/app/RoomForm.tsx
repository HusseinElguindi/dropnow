'use client'
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChangeEvent, useState } from 'react';
 
export function RoomForm() {
  const { push } = useRouter();
  const [RoomID, setRoomID] = useState('')
  
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setRoomID(e.target.value.replaceAll(' ', '-'))
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="Room ID" className="text-lg sm:text-base" value={RoomID} onChange={onChange}/>
      <Button type="submit" onClick={() => RoomID && push(`/room/${RoomID}`)}>Create</Button>
    </div>
  )
}
