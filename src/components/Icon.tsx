type Name = 'feed' | 'add' | 'grid' | 'login' | 'heart' | 'next' | 'pause' | 'play'
const paths: Record<Name, string> = {
  feed: 'M6 3 21 12 6 21Z',
  add: 'M12 4v16M4 12h16',
  grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  login: 'M14 3h6v18h-6M3 12h12M10 7l5 5-5 5',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  next: 'M12 3v18M5 14l7 7 7-7',
  pause: 'M8 4v16M16 4v16',
  play: 'M6 3 21 12 6 21Z',
}
export function Icon({ name }: { name: Name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
