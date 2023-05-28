"use client"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { Transition } from "react-transition-group"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import SendFormCard from "./send/SendFormCard"
import SendProgressCard from "./send/SendProgressCard"


const duration = 300;
const defaultStyle = {
  position: 'absolute'
}
const transitionStyles = {
  left: {
    entering: { transform: 'translateX(0%)', transition: `transform ${duration}ms ease` },
    entered: { transform: "translateX(0%)" },
    exiting: { transform: 'translateX(-120%)', transition: `transform ${duration}ms ease` },
    exited: { transform: "translateX(-120%)" },
  },
  right: {
    entering: { transform: 'translateX(0%)', transition: `transform ${duration}ms ease` },
    entered: { transform: "translateX(0%)" },
    exiting: { transform: 'translateX(120%)', transition: `transform ${duration}ms ease` },
    exited: { transform: "translateX(120%)" },
  },
};

export default function Page({ params: { id } }: { params: { id: string } }) {
  const [InFile, setInFile] = useState<File | null>(null)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setInFile(e.target.files && e.target.files[0])

  const [sendClicked, setSendClicked] = useState(false);
  const onSendClick = () => {
    setSendClicked(true)
    // setCancelClicked(false)
  }

  const nodeRef = useRef<HTMLDivElement>(null)
  const nodeRef2 = useRef<HTMLDivElement>(null)

  const [height, setHeight] = useState<number>(nodeRef.current?.offsetHeight)
  const calcHeight = (e: HTMLElement) => {
    console.log(e?.offsetHeight || 0)
    setHeight(e?.offsetHeight || 0)
  }

  useEffect(() => {
    console.log("height here", nodeRef.current?.offsetHeight)
    setHeight(nodeRef.current?.offsetHeight)
  }, [])

  const cardRef = useRef()
  const [width, setWidth] = useState<number>();
  useEffect(() => {
    const handleResize = () => setWidth((cardRef && cardRef.current?.offsetWidth) || 0)
    console.log("width", cardRef.current?.offsetWidth)
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cardRef])


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

      <Card ref={cardRef} className="relative max-w-sm overflow-hidden overflow-y-hidden" style={{ overflow: "hidden", transition: `height ${duration}ms ease`, height: `${height}px` }}>
        <Transition nodeRef={nodeRef} timeout={duration} in={!sendClicked} onEnter={() => calcHeight(nodeRef.current)} unmountOnExit>
          {state => (
            <div ref={nodeRef} style={{ ...defaultStyle, ...transitionStyles.left[state], width: `${width}px` }}>
              <SendFormCard onFileChange={onChange} onSendClick={onSendClick} />
            </div>
          )}
        </Transition>
        <Transition nodeRef={nodeRef2} timeout={duration} in={sendClicked} onEnter={() => calcHeight(nodeRef2.current)} unmountOnExit>
          {state => (
            <div ref={nodeRef2} style={{ ...defaultStyle, ...transitionStyles.right[state], width: `${width}px` }}>
              <SendProgressCard file={InFile} onCancelClick={() => setSendClicked(false)} />
            </div>
          )}
        </Transition>
      </Card>
    </section>
  )
}
