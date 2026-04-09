import { useSnapshot } from 'valtio'

import Select, { SelectItem } from '@/components/Select'
import Switch from '@/components/Switch'
import { slideDownTransition } from '@/utils/animation'
import { videoProxy } from '../-state'

const FPS = [24, 25, 30, 50, 60] as const

function VideoFPS() {
  const {
    state: {
      isCompressing,
      isCompressionSuccessful,
      config: { shouldEnableCustomFPS, customFPS },
      fps,
    },
  } = useSnapshot(videoProxy)

  return (
    <>
      <Switch
        isSelected={shouldEnableCustomFPS}
        onValueChange={() => {
          videoProxy.state.config.shouldEnableCustomFPS = !shouldEnableCustomFPS
        }}
        isDisabled={isCompressing || isCompressionSuccessful}
      >
        <p className="text-gray-600 dark:text-gray-400 text-sm mr-2 w-full">
          FPS
        </p>
      </Switch>

      {shouldEnableCustomFPS ? (
        <div {...slideDownTransition}>
          <Select
            fullWidth
            label="Frames Per Second:"
            className="block flex-shrink-0 rounded-2xl !mt-8"
            selectedKeys={[String(customFPS ?? fps)!]}
            size="sm"
            value={String(customFPS ?? fps)}
            onChange={(evt) => {
              const value = evt?.target?.value
              if (value && !Number.isNaN(+value)) {
                videoProxy.state.config.customFPS = +value
              }
            }}
            selectionMode="single"
            isDisabled={isCompressing || isCompressionSuccessful}
            classNames={{
              label: '!text-gray-600 dark:!text-gray-400 text-xs',
            }}
          >
            {FPS?.map((f) => (
              <SelectItem
                key={String(f)}
                value={String(f)}
                className="flex justify-center items-center"
              >
                {String(f)}
              </SelectItem>
            ))}
          </Select>
        </div>
      ) : null}
    </>
  )
}

export default VideoFPS
