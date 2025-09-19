"use client"

import type React from "react"
import { useState } from "react"

interface PipelineDropZoneProps {
  targetStatus: string
  children: React.ReactNode
  onLeadStatusUpdate: (leadId: string, newStatus: string) => Promise<boolean>
}

export function PipelineDropZone({ targetStatus, children, onLeadStatusUpdate }: PipelineDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"))
      const { leadId, currentStatus } = data

      // Don't update if dropping in the same status
      if (currentStatus === targetStatus) {
        return
      }

      const success = await onLeadStatusUpdate(leadId, targetStatus)

      if (!success) {
        console.error("Failed to update lead status")
      }
    } catch (error) {
      console.error("Error handling drop:", error)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all ${isDragOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      {children}
    </div>
  )
}
