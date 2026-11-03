import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = 5173
const API_URL = 'http://127.0.0.1:3000'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use('/api', async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/api${req.url}`)

    const data = await response.text()

    res.status(response.status)

    res.set(
      'Content-Type',
      response.headers.get('content-type') || 'application/json'
    )

    res.send(data)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Backend unavailable'
    })
  }
})

app.use(express.static(path.join(__dirname, '../public')))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend running on port ${PORT}`)
})
