import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3000

app.use(express.json())

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    team: 'ip26-pulse'
  })
})

app.get('/api/v1/schedules', async (req, res) => {
  try {
    const yearLevel = req.query.yearLevel

    if (
      yearLevel !== undefined &&
      !['1', '2', '3', '4'].includes(yearLevel)
    ) {
      return res.status(400).json({
        error: 'Invalid yearLevel'
      })
    }

    const schedules = await prisma.courseSchedule.findMany({
      where: yearLevel
        ? {
            course: {
              yearLevel: Number(yearLevel)
            }
          }
        : undefined,
      include: {
        course: true
      }
    })

    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7
    }

    schedules.sort((a, b) => {
      return (
        a.course.yearLevel - b.course.yearLevel ||
        a.course.id - b.course.id ||
        a.section - b.section ||
        dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek] ||
        a.startTime.localeCompare(b.startTime) ||
        a.id - b.id
      )
    })

    const result = schedules.map((schedule) => ({
      id: schedule.id,
      course: {
        id: schedule.course.id,
        code: schedule.course.code,
        title: schedule.course.title,
        type: schedule.course.type,
        yearLevel: schedule.course.yearLevel
      },
      section: schedule.section,
      startWeek: schedule.startWeek,
      endWeek: schedule.endWeek,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      studentGroup: schedule.studentGroup,
      remarks: schedule.remarks
    }))

    res.json(result)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
