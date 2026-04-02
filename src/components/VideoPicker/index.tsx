import React from 'react'

type ChildrenFnParams = { onClick: () => void }

type VideoPickerProps = {
  children: (_: ChildrenFnParams) => React.ReactNode
  onSuccess?: (_: { file: File }) => void
  onError?: (_: { message: string }) => void
}

export default function VideoPicker({
  children,
  onSuccess,
  onError,
}: VideoPickerProps) {
  async function onClick() {
    try {
      // Создаем скрытый input для выбора файла
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'

      const filePromise = new Promise<File>((resolve, reject) => {
        input.onchange = () => {
          if (input.files && input.files[0]) {
            resolve(input.files[0])
          } else {
            reject(new Error('No file selected'))
          }
        }

        input.oncancel = () => {
          reject(new Error('File selection cancelled'))
        }
      })

      input.click()

      const file = await filePromise
      onSuccess?.({ file })
    } catch (error: any) {
      onError?.({ message: error?.message ?? 'Could not select video.' })
    }
  }

  return children({ onClick })
}
