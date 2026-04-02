const express = require('express')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

ffmpeg.setFfmpegPath(ffmpegPath)

const app = express()
app.use(cors())

// Serve static files from the 'dist' directory (production build)
app.use(express.static(path.join(__dirname, '../dist')))

// Configure multer for file uploads
const uploadFolder = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder)
}
const upload = multer({ dest: uploadFolder })

const clients = new Map()

// QUEUE SYSTEM
const CONCURRENT_JOBS = 1
let activeJobs = 0
const jobQueue = []

function processQueue() {
  if (activeJobs >= CONCURRENT_JOBS || jobQueue.length === 0) return

  const job = jobQueue.shift()
  activeJobs++

  // Notify remaining queue items about their new position
  jobQueue.forEach((waitingJob, index) => {
    if (clients.has(waitingJob.jobId)) {
      clients
        .get(waitingJob.jobId)
        .write(
          `data: ${JSON.stringify({ queued: true, position: index + 1 })}\n\n`,
        )
    }
  })

  job.execute().finally(() => {
    activeJobs--
    processQueue()
  })
}

app.get('/api/progress/:jobId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const jobId = req.params.jobId
  clients.set(jobId, res)

  req.on('close', () => {
    clients.delete(jobId)
  })
})

app.get('/api/download/:jobId', (req, res) => {
  try {
    const jobId = req.params.jobId
    const fileName = `compressed_${jobId}.mp4`
    const filePath = path.join(uploadFolder, fileName)

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.setHeader('Content-Type', 'video/mp4')

      const fileStream = fs.createReadStream(filePath)

      fileStream.on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).send('Internal stream error')
        } else {
          res.end()
        }
      })

      fileStream.pipe(res)

      res.on('finish', () => {
        setTimeout(
          () => {
            fs.unlink(filePath, () => {})
          },
          5 * 60 * 1000,
        )
      })
    } else {
      res.status(404).send('File not found or already downloaded.')
    }
  } catch (_err) {
    res.status(500).send('Internal Server Error')
  }
})

app.post('/api/compress', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.')
  }

  const jobId = req.body.jobId || Date.now().toString()
  const inputPath = req.file.path
  const outputFileName = `compressed_${jobId}.mp4`
  const outputPath = path.join(uploadFolder, outputFileName)
  res.status(200).json({ status: 'Processing queued', jobId })

  const executeJob = () =>
    new Promise((resolve) => {
      // Notify client that processing has actually started
      if (jobId && clients.has(jobId)) {
        clients
          .get(jobId)
          .write(
            `data: ${JSON.stringify({ percent: 0, status: 'Starting' })}\n\n`,
          )
      }

      let lastPercent = 0

      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .size('?x720') // Resize to 720p height, auto width
        .outputOptions([
          '-preset',
          'faster', // Good balance between speed and compression
          '-crf',
          '35', // Highly aggressive compression (lower quality, tiny size)
          '-acodec',
          'aac', // Compress audio to AAC
          '-b:a',
          '128k', // Limit audio bitrate
          '-movflags',
          '+faststart',
        ])
        .on('progress', (progress) => {
          const percent = progress.percent ? Math.round(progress.percent) : 0
          if (percent > lastPercent) {
            lastPercent = percent
            if (jobId && clients.has(jobId)) {
              clients
                .get(jobId)
                .write(`data: ${JSON.stringify({ percent })}\n\n`)
            }
          }
        })
        .on('end', () => {
          if (jobId && clients.has(jobId)) {
            clients
              .get(jobId)
              .write(
                `data: ${JSON.stringify({ percent: 100, done: true, url: `/api/download/${jobId}` })}\n\n`,
              )
          }
          fs.unlink(inputPath, () => {})
          resolve()
        })
        .on('error', (err) => {
          if (jobId && clients.has(jobId)) {
            clients
              .get(jobId)
              .write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          }
          fs.unlink(inputPath, () => {})
          if (fs.existsSync(outputPath)) {
            fs.unlink(outputPath, () => {})
          }
          resolve()
        })
        .run()
    })

  jobQueue.push({ jobId, execute: executeJob })
  processQueue()
})

const PORT = 3000
app.listen(PORT, () => {
  // Run initial cleanup on start
  cleanOldFiles()
})

// Periodic cleanup of all files in 'uploads' older than 2 hours
// This handles cases where files were never downloaded.
function cleanOldFiles() {
  const now = Date.now()
  const maxAge = 2 * 60 * 60 * 1000 // 2 hours in ms

  fs.readdir(uploadFolder, (err, files) => {
    if (err) {
      return
    }

    files.forEach((file) => {
      const filePath = path.join(uploadFolder, file)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return
        }

        if (now - stats.mtimeMs > maxAge) {
          fs.unlink(filePath, () => {})
        }
      })
    })
  })
}

// Run cleanup every 15 minutes
setInterval(cleanOldFiles, 15 * 60 * 1000)

// Catch-all middleware to serve index.html for any client-side routes (SPA)
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Not Found (Build missing? Run npm run build)')
  }
})
