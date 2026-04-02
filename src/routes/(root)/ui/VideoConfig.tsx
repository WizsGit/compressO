import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { snapshot, useSnapshot } from 'valtio'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Layout from '@/components/Layout'
import Spinner from '@/components/Spinner'
import { toast } from '@/components/Toast'
import { zoomInTransition } from '@/utils/animation'
import { cn } from '@/utils/tailwind'
import Compressing from './Compressing'
import FileName from './FileName'
import PreviewVideo from './PreviewVideo'
import styles from './styles.module.css'
import { videoProxy } from '../-state'

function VideoConfig() {
  const {
    state: {
      isCompressing,
      id: videoId,
      isThumbnailGenerating,
      fileName,
      isCompressionSuccessful,
      size: videoSize,
    },
  } = useSnapshot(videoProxy)

  const handleCompression = async () => {
    const videoSnapshot = snapshot(videoProxy)
    if (videoSnapshot.state.isCompressing) return
    try {
      videoProxy.takeSnapshot('beforeCompressionStarted')
      videoProxy.state.isCompressing = true
      videoProxy.state.compressionProgress = 0

      const jobId = Math.random().toString(36).substring(2, 9)
      videoProxy.state.id = jobId

      const formData = new FormData()
      formData.append('video', videoProxy.state.file as File)
      formData.append('jobId', jobId)

      const eventSource = new EventSource(`/api/progress/${jobId}`)
      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.error) {
            eventSource.close()
            toast.error('Compression failed.')
            videoProxy.timeTravel('beforeCompressionStarted')
          } else if (data.queued) {
            videoProxy.state.queuePosition = data.position
          } else if (data.done) {
            videoProxy.state.compressionProgress = 100
            videoProxy.state.queuePosition = null
            eventSource.close()

            toast.success('Успешно! Началась загрузка...')

            // Safest way to trigger a download without user gesture blockers
            window.location.assign(data.url)

            videoProxy.state.isCompressing = false

            // Auto reset back to picker after triggering download!
            setTimeout(() => {
              videoProxy.resetProxy()
            }, 1000)
          } else {
            if (data.percent !== undefined) {
              videoProxy.state.compressionProgress = data.percent
              videoProxy.state.queuePosition = null
            }
          }
        } catch (_err) {}
      }

      eventSource.onerror = (err) => {
        eventSource.close()
      }

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }
      // Process continues via SSE onmessage
    } catch (_error) {
      toast.error('Произошла ошибка при сжатии.')
      videoProxy.timeTravel('beforeCompressionStarted')
    }
  }

  return (
    <Layout
      containerProps={{
        className: 'relative h-screen flex justify-center items-center',
      }}
      childrenProps={{ className: 'm-auto w-full' }}
      hideLogo
    >
      {!isThumbnailGenerating ? (
        <div
          className={cn([
            'w-full max-w-lg mx-auto my-auto',
            styles.videoConfigContainer,
          ])}
        >
          <AnimatePresence>
            <section className="px-6 py-8 flex flex-col justify-center items-center rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden">
              {fileName && !isCompressing ? <FileName /> : null}

              {isCompressing ? (
                <div className="py-10">
                  <Compressing />
                </div>
              ) : (
                <motion.div
                  className="flex flex-col justify-center items-center w-full"
                  {...zoomInTransition}
                >
                  <PreviewVideo />
                  <div className="mt-6 flex flex-col w-full items-center gap-4">
                    <p className="text-gray-500 font-medium">
                      Размер видео: {videoSize}
                    </p>
                    <Button
                      as={motion.button}
                      color="primary"
                      onPress={handleCompression}
                      fullWidth
                      isLoading={isCompressing}
                      isDisabled={isCompressing}
                      className="text-white bg-primary font-bold py-5 mt-2 text-lg lg:text-xl rounded-2xl flex justify-center items-center gap-2 hover:opacity-90 shadow-md transition-opacity w-full"
                    >
                      {isCompressing ? 'Сжатие...' : 'Сжать видео'}
                      <Icon name="logo" size={24} className="text-white" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </section>
          </AnimatePresence>
        </div>
      ) : (
        <Spinner size="lg" />
      )}
    </Layout>
  )
}

export default React.memo(VideoConfig)
