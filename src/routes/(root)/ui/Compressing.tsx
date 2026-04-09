import React from 'react'
import { useSnapshot } from 'valtio'

import Progress from '@/components/Progress'
import { videoProxy } from '../-state'

function Compressing() {
  const {
    state: {
      isCompressing,
      videDurationRaw,
      compressionProgress,
      queuePosition,
    },
  } = useSnapshot(videoProxy)

  return isCompressing ? (
    <div className="w-full flex flex-col justify-center items-center flex-shrink-0">
      <div className="relative flex items-center justify-center min-h-[400px] hlg:min-h-[450px]">
        <Progress
          {...(videDurationRaw == null
            ? { isIndeterminate: true }
            : { value: compressionProgress })}
          classNames={{
            base: 'relative z-20',
            svg: 'w-[480px] h-[480px] hlg:w-[540px] hlg:h-[540px] drop-shadow-md',
            indicator: 'stroke-primary stroke-1',
            track: 'stroke-transparent stroke-1',
            value: 'text-3xl font-semibold text-primary',
          }}
          strokeWidth={2}
          aria-label={`Progress-${compressionProgress}%`}
        />
      </div>
      <p className="italic text-sm mt-10 text-gray-600 dark:text-gray-400 text-center animate-pulse">
        {queuePosition
          ? `Сервер загружен. Ожидание в очереди... Перед вами: ${queuePosition} видео.`
          : 'Сжатие видео... Пожалуйста, подождите.'}
      </p>
      <p
        className={`not-italic text-2xl text-center font-bold text-primary my-4 ${
          !queuePosition && compressionProgress && compressionProgress > 0
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        {compressionProgress?.toFixed(2)}%
      </p>
    </div>
  ) : null
}

export default React.memo(Compressing)
