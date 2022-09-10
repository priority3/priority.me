export interface PlumProps {
  start: {
    x: number
    y: number
  }
}
export default function Plum(props: PlumProps) {
  console.log(props)

  return (
    <div>
      this is plum
    </div>
  )
}
