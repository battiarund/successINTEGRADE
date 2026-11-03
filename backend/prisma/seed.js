import 'dotenv/config'
import XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const excelPath =
  '/opt/int504-2026-itb-csv-requirements/itb-csv-requirements.xlsx'

function excelTimeToString(value) {
  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 24 * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  return value
}

async function main() {
  const workbook = XLSX.readFile(excelPath)

  const coursesSheet = workbook.Sheets['Test Data - courses']
  const courses = XLSX.utils.sheet_to_json(coursesSheet)

  const schedulesSheet = workbook.Sheets['Test Data - courses_schedule']
  const schedules = XLSX.utils.sheet_to_json(schedulesSheet)

  console.log(`courses: ${courses.length}`)
  console.log(`schedules before filter: ${schedules.length}`)

  const validSchedules = schedules.filter(
    (row) => row.id !== undefined && row.course_id !== undefined
  )

  console.log(`schedules after filter: ${validSchedules.length}`)

  await prisma.courseSchedule.deleteMany()
  await prisma.course.deleteMany()

  await prisma.course.createMany({
    data: courses
      .filter((row) => row.id !== undefined)
      .map((row) => ({
        id: Number(row.id),
        code: row.code,
        title: row.title,
        type: row.type,
        yearLevel: Number(row.year_level)
      }))
  })

  await prisma.courseSchedule.createMany({
    data: validSchedules.map((row) => ({
      id: Number(row.id),
      courseId: Number(row.course_id),
      section: Number(row.section),
      startWeek: Number(row.start_week),
      endWeek: Number(row.end_week),
      dayOfWeek: row.day_of_week,
      startTime: excelTimeToString(row.start_time),
      endTime: excelTimeToString(row.end_time),
      room: row.room || null,
      studentGroup: row.student_group || null,
      remarks: row.remarks || null
    }))
  })

  console.log('Seed completed successfully')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
