// import Link from "next/link"

// import { siteConfig } from "@/config/site"
// import { buttonVariants } from "@/components/ui/button"
import { RoomForm } from "./RoomForm"


export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
          Peer-to-peer, cross-platform file sharing.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Only peer-to-peer transfer connections; no intermediate server touches your data.
        </p>
      </div>
      <div className="space-y-2">
        <h1 className="text-base font-semibold">Create a room</h1>
        <RoomForm />
      </div>
    </section>
  )
}
