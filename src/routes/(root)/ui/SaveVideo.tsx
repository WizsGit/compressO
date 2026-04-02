'use client'

import React from 'react'
import { snapshot, useSnapshot } from 'valtio'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import { toast } from '@/components/Toast'
import { videoProxy } from '../-state'

function Success() {
  const {
    state: { compressedVideo, isCompressionSuccessful, fileName },
  } = useSnapshot(videoProxy)

  const fileNameDisplay =
    (isCompressionSuccessful ? compressedVideo?.fileNameToDisplay : fileName) ??
    'video.mp4'

  const handleCompressedVideoSave = async () => {
    if (!compressedVideo?.pathRaw) return

    try {
      videoProxy.state.compressedVideo = {
        ...(snapshot(videoProxy).state.compressedVideo ?? {}),
        isSaving: true,
        isSaved: false,
      }

      // Web native download
      const a = document.createElement('a')
      a.href = compressedVideo.pathRaw // the blob URL or object URL
      a.download = `compressO-${fileNameDisplay}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Mark as saved after a slight delay to allow UI to update
      setTimeout(() => {
        videoProxy.state.compressedVideo = {
          ...(snapshot(videoProxy).state.compressedVideo ?? {}),
          savedPath: `compressO-${fileNameDisplay}`,
          isSaving: false,
          isSaved: true,
        }
      }, 500)
    } catch (_) {
      toast.error('Could not save video to the given path.')
      videoProxy.state.compressedVideo = {
        ...(snapshot(videoProxy).state.compressedVideo ?? {}),
        isSaving: false,
        isSaved: false,
      }
    }
  }

  return (
    <div className="flex items-center">
      <Button
        className="flex justify-center items-center"
        color="success"
        onPress={handleCompressedVideoSave}
        isLoading={compressedVideo?.isSaving}
        isDisabled={compressedVideo?.isSaving || compressedVideo?.isSaved}
        fullWidth
        size="lg"
      >
        {compressedVideo?.isSaved ? 'Saved' : 'Save Video'}
        <Icon
          name={compressedVideo?.isSaved ? 'tick' : 'save'}
          className="text-green-300"
        />
      </Button>
    </div>
  )
}

export default React.memo(Success)
