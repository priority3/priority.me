import React from 'react'
import './style/avatorName.css'

interface AvatorNameProps {
  isDark: boolean
}

export default function ({ isDark }: AvatorNameProps) {
  const logoColor = isDark ? '#fdfdfd' : '#303030'

  return <svg width="120" height="50" stroke={logoColor} viewBox="0 0 202 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path id="path1" strokeWidth="2" d="M17.3 62.6C15.0333 62.6 13.2333 62 11.9 60.8C10.6333 59.6 10 58.0333 10 56.1C10 54.1 10.4667 52 11.4 49.8C12.3333 47.6 13.2333 45.4333 14.1 43.3C15.0333 41.1 15.5 39.1333 15.5 37.4C15.5 35.2667 14.8667 33.7 13.6 32.7C12.4 31.6333 11.1667 30.6667 9.9 29.8C8.36667 33.7333 6.76667 37.4667 5.1 41C3.43333 44.5333 2.06667 47.2 1 49L0.1 47.3C1.03333 45.5667 2.23333 43.0333 3.7 39.7C5.23333 36.3667 6.73333 32.5667 8.2 28.3C7.53333 27.6333 7.2 26.8333 7.2 25.9C7.2 23.9 7.76667 22.2667 8.9 21C10.0333 19.7333 10.8667 19.1 11.4 19.1C12.1333 19.1 12.5333 19.4333 12.6 20.1C12.7333 20.7 12.8 21.1667 12.8 21.5C12.8 21.8333 12.6 22.5 12.2 23.5C11.8667 24.4333 11.7 25 11.7 25.2C11.7 26.1333 12.2 27 13.2 27.8C14.2667 28.5333 15.4667 29.4 16.8 30.4C18.1333 31.3333 19.3 32.5 20.3 33.9C21.3667 35.2333 21.9 36.9667 21.9 39.1C21.9 41.1 21.4667 43.1333 20.6 45.2C19.8 47.2667 18.9667 49.2333 18.1 51.1C17.3 52.9667 16.9 54.6 16.9 56C16.9 57.2 17.2 58 17.8 58.4C18.4 58.8 19.1 59 19.9 59C21.5 59 23.1333 58.5 24.8 57.5C26.5333 56.5 28.2 55.2333 29.8 53.7C31.4 52.1667 32.8333 50.5667 34.1 48.9C35.3667 47.1667 36.3 45.5667 36.9 44.1L38.2 45.1C36.9333 47.9 35.2 50.6667 33 53.4C30.8 56.0667 28.3333 58.2667 25.6 60C22.9333 61.7333 20.1667 62.6 17.3 62.6ZM39.5656 64.7C37.499 64.7 35.7656 64 34.3656 62.6C32.899 61.2667 32.1656 59.2 32.1656 56.4C32.1656 54 32.699 51.4333 33.7656 48.7C34.8323 45.9 36.299 43.1667 38.1656 40.5C40.0323 37.7667 42.1323 35.3 44.4656 33.1C46.8656 30.8333 49.3656 29.0333 51.9656 27.7C54.6323 26.3667 57.2656 25.7 59.8656 25.7C62.4656 25.7 64.6323 26.4 66.3656 27.8C68.099 29.1333 68.9656 30.9333 68.9656 33.2C68.9656 34.8667 68.499 36 67.5656 36.6C66.699 37.2 65.5323 37.5 64.0656 37.5C64.199 36.9667 64.299 36.4 64.3656 35.8C64.499 35.1333 64.5656 34.5333 64.5656 34C64.5656 32.4667 64.199 31.1667 63.4656 30.1C62.7323 28.9667 61.4656 28.4 59.6656 28.4C57.799 28.4 55.899 29.0667 53.9656 30.4C52.0323 31.6667 50.1656 33.4 48.3656 35.6C46.5656 37.7333 44.9656 40.0667 43.5656 42.6C42.1656 45.1333 41.0656 47.6333 40.2656 50.1C39.4656 52.5667 39.0656 54.7667 39.0656 56.7C39.0656 59.3 39.9656 60.6 41.7656 60.6C43.299 60.6 44.9656 59.9 46.7656 58.5C48.5656 57.0333 50.399 55.2 52.2656 53C54.199 50.7333 56.0323 48.4 57.7656 46C59.499 43.6 61.0323 41.4 62.3656 39.4C62.6323 39 62.799 38.8 62.8656 38.8C63.2656 38.8667 63.7656 39 64.3656 39.2C65.0323 39.4 65.599 39.6667 66.0656 40C66.5323 40.3333 66.7656 40.7667 66.7656 41.3C66.7656 41.9 66.4656 42.7333 65.8656 43.8C65.2656 44.8 64.599 45.9667 63.8656 47.3C63.1323 48.6333 62.4656 50 61.8656 51.4C61.2656 52.7333 60.9656 54 60.9656 55.2C60.9656 56.2 61.2323 57.2 61.7656 58.2C62.299 59.1333 63.1656 59.6 64.3656 59.6C66.1656 59.6 68.5323 58.3 71.4656 55.7C74.399 53.0333 77.3656 49.0667 80.3656 43.8L81.3656 44.8C79.9656 48.4 78.1656 51.5667 75.9656 54.3C73.7656 57.0333 71.399 59.1667 68.8656 60.7C66.399 62.2333 63.9656 63 61.5656 63C59.099 63 57.2656 62.2667 56.0656 60.8C54.9323 59.3333 54.3656 57.7333 54.3656 56C54.3656 55.6 54.399 55.1667 54.4656 54.7C54.5323 54.1667 54.599 53.6333 54.6656 53.1C51.799 56.9667 49.1656 59.8667 46.7656 61.8C44.4323 63.7333 42.0323 64.7 39.5656 64.7ZM77.8203 88C75.7536 88 74.1536 87.6 73.0203 86.8C71.8203 86.0667 71.2203 84.7667 71.2203 82.9C71.2203 80.7667 71.9536 78.7667 73.4203 76.9C74.8203 75.1 76.7203 73.3667 79.1203 71.7C81.5203 70.0333 84.1536 68.3333 87.0203 66.6C89.9536 64.9333 92.8536 63.1333 95.7203 61.2C95.7203 58.8 95.2203 56.6 94.2203 54.6C93.2203 52.6 91.4203 50.5667 88.8203 48.5C91.1536 47.8333 93.1203 46.6667 94.7203 45C96.387 43.3333 97.6203 41.5 98.4203 39.5C99.287 37.4333 99.7203 35.5333 99.7203 33.8C99.7203 32.2667 99.387 31 98.7203 30C98.1203 29 97.1536 28.5 95.8203 28.5C93.6203 28.5 91.6536 29.3333 89.9203 31C88.187 32.6667 86.587 34.8667 85.1203 37.6C83.6536 40.3333 82.1536 43.3333 80.6203 46.6L79.4203 45.6C80.887 41.6 82.387 38.0333 83.9203 34.9C85.5203 31.7667 87.387 29.3 89.5203 27.5C91.6536 25.6333 94.2203 24.7 97.2203 24.7C99.487 24.7 101.42 25.4333 103.02 26.9C104.687 28.3667 105.52 30.3667 105.52 32.9C105.52 35.3 104.954 37.5333 103.82 39.6C102.687 41.6667 101.22 43.5 99.4203 45.1C97.6203 46.6333 95.7203 47.9 93.7203 48.9C95.4536 50.2333 96.887 51.6667 98.0203 53.2C99.2203 54.6667 100.12 56.2333 100.72 57.9C103.254 55.9667 105.487 53.8667 107.42 51.6C109.42 49.2667 110.887 46.6667 111.82 43.8L112.92 45C111.987 48 110.487 50.7333 108.42 53.2C106.354 55.6 103.987 57.8 101.32 59.8C101.454 60.2667 101.554 60.8 101.62 61.4C101.687 62 101.72 62.5667 101.72 63.1C101.72 66.1 101.054 69.0667 99.7203 72C98.387 75 96.587 77.7 94.3203 80.1C92.0536 82.5 89.487 84.4 86.6203 85.8C83.8203 87.2667 80.887 88 77.8203 88ZM77.1203 85.1C78.3203 85.1 79.887 84.6 81.8203 83.6C83.7536 82.6667 85.7203 81.2667 87.7203 79.4C89.7203 77.6 91.4536 75.3667 92.9203 72.7C94.387 70.0333 95.287 66.9667 95.6203 63.5C92.9536 65.1667 90.3203 66.7333 87.7203 68.2C85.187 69.7333 82.887 71.2 80.8203 72.6C78.7536 74.0667 77.1203 75.5333 75.9203 77C74.6536 78.5333 74.0203 80.1333 74.0203 81.8C74.0203 82.9333 74.3203 83.7667 74.9203 84.3C75.5203 84.8333 76.2536 85.1 77.1203 85.1ZM120.859 64.4C116.792 64.4 113.725 63.2667 111.659 61C109.659 58.8 108.659 56.0667 108.659 52.8C108.659 49.8 109.392 46.6333 110.859 43.3C112.392 39.9667 114.392 36.8333 116.859 33.9C119.392 30.9667 122.159 28.6 125.159 26.8C128.159 24.9333 131.125 24 134.059 24C135.592 24 136.992 24.4 138.259 25.2C139.592 26 140.259 27.6333 140.259 30.1C140.259 32.6333 139.492 35.0333 137.959 37.3C136.492 39.5 134.525 41.4667 132.059 43.2C129.659 44.9333 126.992 46.3667 124.059 47.5C121.192 48.5667 118.325 49.2333 115.459 49.5C115.325 50.1667 115.225 50.8 115.159 51.4C115.092 52 115.059 52.5667 115.059 53.1C115.059 54.1 115.159 55.1 115.359 56.1C115.625 57.1 116.059 58.0333 116.659 58.9C117.259 59.7 118.059 60.3333 119.059 60.8C120.125 61.2667 121.425 61.5 122.959 61.5C125.825 61.5 128.659 60.7 131.459 59.1C134.259 57.4333 136.859 55.2667 139.259 52.6C141.659 49.9333 143.692 47 145.359 43.8L146.559 44.7C144.759 48.7 142.459 52.1667 139.659 55.1C136.925 58.0333 133.925 60.3 130.659 61.9C127.459 63.5667 124.192 64.4 120.859 64.4ZM115.959 47.6C117.759 47 119.792 46.1333 122.059 45C124.325 43.8 126.492 42.4 128.559 40.8C130.692 39.2 132.425 37.4333 133.759 35.5C135.159 33.5667 135.859 31.5333 135.859 29.4C135.859 28.6667 135.725 28.1 135.459 27.7C135.192 27.3 134.625 27.1 133.759 27.1C132.159 27.1 130.459 27.7333 128.659 29C126.859 30.2 125.125 31.8 123.459 33.8C121.792 35.8 120.292 38 118.959 40.4C117.625 42.8 116.625 45.2 115.959 47.6ZM177.836 64.6C174.969 64.6 172.769 63.7667 171.236 62.1C169.703 60.4333 168.936 57.9667 168.936 54.7C168.936 51.7667 169.469 48.1667 170.536 43.9C171.669 39.5667 173.069 35.1333 174.736 30.6C174.069 30.4667 173.436 30.3667 172.836 30.3C172.236 30.1667 171.669 30 171.136 29.8V28C171.669 28.0667 172.303 28.1333 173.036 28.2C173.769 28.2667 174.603 28.3333 175.536 28.4C176.936 24.8 178.436 21.3333 180.036 18C181.636 14.6 183.203 11.6 184.736 8.99999C186.336 6.33333 187.836 4.23333 189.236 2.7C190.703 1.1 191.936 0.3 192.936 0.3C193.469 0.3 193.936 0.499999 194.336 0.899998C194.803 1.23333 195.036 1.76666 195.036 2.5C195.036 3.63333 194.336 5.5 192.936 8.09999C191.536 10.6333 189.803 13.6667 187.736 17.2C185.669 20.7333 183.669 24.5667 181.736 28.7C182.336 28.7 182.936 28.7 183.536 28.7C184.203 28.7 184.836 28.7 185.436 28.7C187.636 28.7 189.936 28.6667 192.336 28.6C194.803 28.5333 197.269 28.3667 199.736 28.1V29.9C196.069 30.3 192.769 30.6 189.836 30.8C186.969 31 184.403 31.1 182.136 31.1C181.869 31.1 181.603 31.1 181.336 31.1C181.136 31.1 180.903 31.1 180.636 31.1C179.103 34.6333 177.803 38.2667 176.736 42C175.669 45.7333 175.136 49.3667 175.136 52.9C175.136 55.7667 175.569 57.8333 176.436 59.1C177.303 60.3 178.736 60.9 180.736 60.9C184.203 60.9 187.603 59.3667 190.936 56.3C194.269 53.2333 197.203 49.0667 199.736 43.8L201.036 44.8C199.436 48.5333 197.403 51.9 194.936 54.9C192.536 57.9 189.869 60.2667 186.936 62C184.003 63.7333 180.969 64.6 177.836 64.6Z" fill={logoColor} />
  </svg>
}