import React from 'react'
import { useSnapshot } from 'valtio'

import Button from '@/components/Button'
import { toast } from '@/components/Toast'
import { videoProxy } from '../-state'

function CancelCompression() {
  const {
    state: { isCompressing },
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
      <div>
        {confirmCancellation && !isCancelling
          ? 'Confirm Cancel'
          : isCancelling
            ? 'Cancelling...'
            : 'Cancel'}
      </div>
    </Button>
  ) : null
}

export default React.memo(CancelCompression)
