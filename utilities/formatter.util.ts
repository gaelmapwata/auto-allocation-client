import { format, isToday, isYesterday } from 'date-fns'

// eslint-disable-next-line import/prefer-default-export
export const formatters = {
  formatDateFns (date: string, short = false) {
    if (date) {
      const formatDate = (date.length) > 10 && !short ? 'dd/MM/yyyy à HH:mm:ss' : 'dd/MM/yyyy'
      return format(new Date(date), formatDate)
    }
    return ''
  },
  formatDateNotification (payload: string) {
    const date = new Date(payload)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    }
    if (isYesterday(date)) {
      return `${format(date, 'HH:mm')}, Hier`
    }
    return format(date, 'HH:mm, dd/MM/yyyy')
  },
  formatPrice (price: string | number) {
    if (!price) {
      return 0
    }
    return parseFloat(price.toString()).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  },
  formatTel (tel: string) {
    if (tel) {
      return tel
        .replace(/ /g, '')
        .replace(/(.{2})/g, '$1 ')
        .replace(/ (.{1})$/g, '$1')
    }
    return ''
  }
}
