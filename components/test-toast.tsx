"use client"

import { toast } from "sonner"
import { Button } from "./ui/button"

function TestToast() {
  return (
    <div>
        <Button onClick={() => toast.success("Test")} className="bg-green-500 text-white">Test Succès</Button>
        <Button onClick={() => toast.error("Test")} className="bg-red-500 text-white">Test Erreur</Button>
        <Button onClick={() => toast.info("Test")} className="bg-blue-500 text-white">Test Info</Button>
        <Button onClick={() => toast.warning("Test")} className="bg-amber-500 text-white">Test Warning</Button>
        <Button onClick={() => toast("Test")} className="bg-gray-500 text-white">Test Normal</Button>
    </div>
  )
}

export default TestToast