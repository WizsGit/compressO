import React from 'react'

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  disableAnimation?: boolean
}

function Image(props: ImageProps) {
  const { src, fallbackSrc, ...rest } = props
  const [errorCount, setErrorCount] = React.useState(0)

  // If both primary and fallback fail, or if src is empty and fallback fails, hide
  if (errorCount >= 2 || (!src && errorCount >= 1)) {
    return null
  }

  const currentSrc =
    errorCount === 1 ? (fallbackSrc ?? '/default-blurred.jpg') : src

  return (
    <img
      src={currentSrc || (fallbackSrc ?? '/default-blurred.jpg')}
      onLoad={() => setErrorCount(0)}
      onError={() => setErrorCount((prev) => prev + 1)}
      {...rest}
    />
  )
}

export default Image
