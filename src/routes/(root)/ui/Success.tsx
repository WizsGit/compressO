import React from 'react'
import { useSnapshot } from 'valtio'

import { videoProxy } from '../-state'

function Success() {
  const {
    state: { id: jobId },
    resetProxy,
  } = useSnapshot(videoProxy)

  return (
    <section className="animate-appearance-in flex flex-col items-center mt-10">
      <div className="flex justify-center items-center mb-6">
        <p className="text-3xl text-center font-bold mx-4 text-primary">
          Compression Finished!
        </p>
      </div>

      <a
        href={`/api/download/${jobId}`}
        className="mt-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3"
      >
        <span className="text-2xl">📥</span> Download Video
      </a>

      <button
        onClick={() => resetProxy()}
        className="mt-8 px-6 py-3 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:opacity-80 transition-opacity"
      >
        Compress Another Video
      </button>
    </section>
  )
}

export default React.memo(Success)
