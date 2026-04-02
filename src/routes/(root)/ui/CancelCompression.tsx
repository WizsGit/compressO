import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useSnapshot } from 'valtio'

import Button from '@/components/Button'
import { toast } from '@/components/Toast'
import { videoProxy } from '../-state'

function CancelCompression() {
  const {
    state: { isCompressing, id: videoId },
  } = useSnapshot(videoProxy)

  const [confirmCancellation, setConfirmCancellation] = React.useState(false)
  const [isCancelling, setIsCancelling] = React.useState(false)

  const cancelOngoingCompression = async () => {
    try {
      setIsCancelling(true)
      // In a real web app, we would abort the fetch/XHR request here.
      videoProxy.timeTravel('beforeCompressionStarted')
    } catch {
      toast.error('Cannot cancel compression at this point.')
    } finally {
      setIsCancelling(false)
      setConfirmCancellation(false)
    }
  }

  return isCompressing ? (
    <Button
      color="danger"
      size="lg"
      variant={confirmCancellation ? 'solid' : 'flat'}
      onPress={() => {
        if (!confirmCancellation) {
          setConfirmCancellation(true)
        } else {
          cancelOngoingCompression()
        }
      }}
      isLoading={isCancelling}
      isDisabled={isCancelling}
      fullWidth
    >
      <AnimatePresence mode="wait">
        <motion.div layout="preserve-aspect">
          {confirmCancellation && !isCancelling
            ? 'Confirm Cancel'
            : isCancelling
              ? 'Cancelling...'
              : 'Cancel'}
        </motion.div>
      </AnimatePresence>
    </Button>
  ) : null
}

export default React.memo(CancelCompression)
