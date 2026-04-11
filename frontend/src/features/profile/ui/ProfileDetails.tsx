type DetailItem = {
  label: string
  value: string | number
}

type Props = {
  items: DetailItem[]
}

export function ProfileDetails({ items }: Props) {
  return (
    <dl className="profile-details">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
