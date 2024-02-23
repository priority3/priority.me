function extractDate(date: number) {
  return date > 9 ? `${date}` : `0${date}`
}

export function isDate(date: unknown) {
  return Object.prototype.toString.call(date) === '[object Date]'
}

export const formatYMDdate = (date: Date) => {
  if (!date || !isDate(date)) return ''
  const year = date.getFullYear()
  const month = extractDate(date.getMonth() + 1)
  const day = extractDate(date.getDate())
  const hour = extractDate(date.getHours())
  const minutes = extractDate(date.getMinutes())
  const seconds = extractDate(date.getSeconds())

  return `${year}年${month}月${day}日 ${hour}:${minutes}:${seconds}`
}
