function extractDate(date: number) {
  return date > 9 ? `${date}` : `0${date}`
}

export function isDate(date: unknown) {
  return Object.prototype.toString.call(date) === '[object Date]'
}

export const formatYMDdate = (date: Date) => {
  if (!date || !isDate(date)) return ''

  return `${date.getFullYear()}-${extractDate(date.getMonth() + 1)}-${extractDate(date.getDate())}`
}
