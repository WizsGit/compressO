import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { ref, useSnapshot } from 'valtio'

import Icon from '@/components/Icon'
import Layout from '@/components/Layout'
import { toast } from '@/components/Toast'
import VideoPicker from '@/components/VideoPicker'
import { extensions } from '@/types/compression'
import { formatBytes } from '@/utils/fs'
import { videoProxy } from './-state'
import VideoConfig from './ui/VideoConfig'

export const Route = createFileRoute('/(root)/')({
  component: Root,
})

function Root() {
  const { state, resetProxy } = useSnapshot(videoProxy)

  const { isFileSelected, isCompressing } = state

  const handleVideoSelected = React.useCallback(
    async (file: File) => {
      if (isCompressing) return
      try {
        if (!file) {
          toast.error('Invalid file selected.')
          return
        }

        // Проверяем размер файла
        if (file.size <= 1000) {
          toast.error('Invalid file.')
          return
        }

        videoProxy.state.isFileSelected = true
        videoProxy.state.file = ref(file)
        videoProxy.state.fileName = file.name
        videoProxy.state.mimeType = file.type
        videoProxy.state.sizeInBytes = file.size
        videoProxy.state.size = formatBytes(file.size)
        videoProxy.state.isThumbnailGenerating = true

        // Извлекаем расширение из имени файла
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        videoProxy.state.extension = fileExtension ?? null

        if (fileExtension) {
          videoProxy.state.config.convertToExtension =
            fileExtension as keyof (typeof extensions)['video']
        }

        // Генерируем превью видео
        const videoUrl = URL.createObjectURL(file)
        videoProxy.state.path = videoUrl
        videoProxy.state.pathRaw = videoUrl

        // Создаем видео элемент для извлечения метаданных
        const videoElement = document.createElement('video')
        videoElement.preload = 'metadata'

        const [videoInfo, _thumbnailBlob] = await Promise.all([
          new Promise<{
            duration: string
            dimensions: [number, number]
            fps: number
          } | null>((resolve) => {
            videoElement.onloadedmetadata = () => {
              const duration = videoElement.duration.toFixed(2)
              const dimensions = [
                videoElement.videoWidth,
                videoElement.videoHeight,
              ]
              const fps =
                videoElement.videoWidth && videoElement.videoHeight ? 30 : null // Приблизительное значение FPS
              resolve({
                duration,
                dimensions: dimensions as [number, number],
                fps: fps ?? 0,
              })
              // URL.revokeObjectURL(videoUrl)
            }
            videoElement.onerror = () => {
              resolve(null)
              // URL.revokeObjectURL(videoUrl)
            }
            videoElement.src = videoUrl
          }),
          new Promise<Blob | null>((resolve) => {
            const canvas = document.createElement('canvas')
            const img = new Image()
            img.onload = () => {
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                canvas.toBlob(resolve, 'image/png')
              } else {
                resolve(null)
              }
              // URL.revokeObjectURL(videoUrl)
            }
            img.onerror = () => {
              resolve(null)
              // URL.revokeObjectURL(videoUrl)
            }
            // Для получения кадра из видео нужно использовать более сложный подход
            // Пока создадим простую заглушку
            resolve(null)
          }),
        ])

        if (videoInfo) {
          const dimensions = videoInfo.dimensions
          if (!Number.isNaN(dimensions[0]) && !Number.isNaN(dimensions[1])) {
            videoProxy.state.dimensions = {
              width: dimensions[0],
              height: dimensions[1],
            }
          }
          videoProxy.state.videDurationRaw = videoInfo.duration
          videoProxy.state.videoDurationMilliseconds =
            parseFloat(videoInfo.duration) * 1000
          if (videoInfo.fps) {
            videoProxy.state.fps = Math.ceil(videoInfo.fps)
          }
        }

        // Для простоты создаем заглушку для превью
        // В реальном приложении здесь нужно извлекать кадр из видео
        videoProxy.state.isThumbnailGenerating = false
        videoProxy.state.id = Math.random().toString(36).substr(2, 9)
        videoProxy.state.thumbnailPathRaw = videoUrl
        videoProxy.state.thumbnailPath = videoUrl
      } catch (_error) {
        resetProxy()
        toast.error('File seems to be corrupted.')
      }
    },
    [isCompressing, resetProxy],
  )

  return isFileSelected ? (
    <VideoConfig />
  ) : (
    <Layout
      containerProps={{
        className: 'relative h-screen flex justify-center items-center',
      }}
      childrenProps={{ className: 'm-auto' }}
      hideLogo
    >
      <VideoPicker
        onSuccess={({ file }: { file: File }) => handleVideoSelected(file)}
        onError={({ message }: { message: string }) => toast.error(message)}
      >
        {({ onClick }: { onClick: () => void }) => (
          <div
            className="flex flex-col justify-center items-center py-20 px-24 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm"
            onClick={onClick}
          >
            <Icon name="videoFile" className="text-primary mb-4" size={70} />
            <p className="font-semibold text-lg text-gray-700 dark:text-gray-300 text-center">
              Нажмите, чтобы выбрать видеофайл
            </p>
          </div>
        )}
      </VideoPicker>
    </Layout>
  )
}

export default Root
