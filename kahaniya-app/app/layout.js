import './globals.css'
import Nav from '@/components/Nav'
export const metadata = { title: 'Kahaniya – Stories of lives', description: 'Real stories, shared anonymously.' }
export default function RootLayout({ children }) {
  return (<html lang="en"><body><Nav />{children}</body></html>)
}
