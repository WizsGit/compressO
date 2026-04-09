import React from 'react'
import ReactDOM from 'react-dom'

import Icon from '@/components/Icon'
import { toast } from '@/components/Toast'
import { extensions } from '@/types/compression'
import { zoomInTransition } from '@/utils/animation'

const videoExtensions = Object.keys(extensions?.video)

type DragAndDropProps = {
  disable?: boolean
  onFile?: (file: File) => void
}

function DragAndDrop({ disable = false, onFile }: DragAndDropProps) {
  const [dragAndDropState, setDragAndDropState] = React.useState<
    'idle' | 'dragging' | 'dropped'
  >('idle')

  const dragAndDropContainerRef = React.useRef<HTMLDivElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disable) return
    setDragAndDropState('dropped')
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (
        !videoExtensions?.includes(
          fileExtension as keyof typeof extensions.video,
        )
      ) {
        toast.error('Invalid video file.')
      } else {
        onFile?.(file)
      }
    }
    // Reset state after a short delay to allow the drag leave event to fire
    setTimeout(() => {
      setDragAndDropState('idle')
    }, 1000)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disable) return
    setDragAndDropState('dragging')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disable) return
    setDragAndDropState('idle')
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <>
      {ReactDOM.createPortal(
        dragAndDropState === 'dragging' ? (
          <div
            ref={dragAndDropContainerRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="fixed top-0 right-0 bottom-0 left-0 w-screen h-screen bg-zinc-200 dark:bg-zinc-900 flex justify-center items-center flex-col z-[2]"
          >
            <div
              className="flex justify-center items-center flex-col py-16 px-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl"
              {...zoomInTransition}
            >
              <Icon name="dragAndDrop" className="text-primary" size={50} />
              <p className="my-2 text-gray-600 dark:text-gray-400 italic text-sm">
                Drop anywhere...
              </p>
            </div>
          </div>
        ) : null,
        document.getElementById('portal') as HTMLDivElement,
      )}
    </>
  )
}

export default React.memo(DragAndDrop)
