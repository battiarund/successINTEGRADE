const buttons = document.querySelectorAll('#year-buttons button')
const tableBody = document.querySelector('#schedule-body')
const emptyMessage = document.querySelector('#empty-message')

const API_BASE = '/api/v1'

let schedules = []

async function loadSchedules(yearLevel = '') {
  try {
    let url = `${API_BASE}/schedules`

    if (yearLevel) {
      url += `?yearLevel=${yearLevel}`
    }

    console.log('loading:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('API error')
    }

    schedules = await response.json()

    console.log('schedules:', schedules.length)

    renderSchedules()
  } catch (error) {
    console.error(error)
    showError()
  }
}

function renderSchedules() {
  tableBody.innerHTML = ''

  if (schedules.length === 0) {
    emptyMessage.hidden = false
    return
  }

  emptyMessage.hidden = true

  schedules.forEach((schedule) => {
    const row = document.createElement('tr')

    row.setAttribute('data-testid', 'schedule-row')

    row.innerHTML = `
      <td data-testid="schedule-code">${schedule.course.code}</td>
      <td data-testid="schedule-title">${schedule.course.title}</td>
      <td data-testid="schedule-type">${schedule.course.type}</td>
      <td data-testid="schedule-section">${schedule.section}</td>
      <td data-testid="schedule-group">${schedule.studentGroup ?? ''}</td>
      <td data-testid="schedule-day">${formatDay(schedule.dayOfWeek)}</td>
      <td data-testid="schedule-time">
        ${schedule.startTime}-${schedule.endTime}
      </td>
      <td data-testid="schedule-weeks">
        ${schedule.startWeek}-${schedule.endWeek}
      </td>
      <td data-testid="schedule-remarks">${schedule.remarks ?? ''}</td>
    `

    tableBody.appendChild(row)
  })
}

function formatDay(day) {
  return day.charAt(0) + day.slice(1).toLowerCase()
}

function showError() {
  const dialog = document.createElement('dialog')

  dialog.textContent =
    'There is a problem. Please try again later.'

  document.body.appendChild(dialog)

  dialog.showModal()
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const yearLevel = button.dataset.year

    console.log('clicked year:', yearLevel)

    buttons.forEach((item) => {
      item.setAttribute('aria-pressed', 'false')
    })

    button.setAttribute('aria-pressed', 'true')

    const url = new URL(window.location)

    if (yearLevel) {
      url.searchParams.set('yearLevel', yearLevel)
    } else {
      url.searchParams.delete('yearLevel')
    }

    history.pushState({}, '', url)

    loadSchedules(yearLevel)
  })
})

const params = new URLSearchParams(window.location.search)

const initialYear = params.get('yearLevel') || ''

buttons.forEach((button) => {
  button.setAttribute(
    'aria-pressed',
    button.dataset.year === initialYear ? 'true' : 'false'
  )
})

loadSchedules(initialYear)
