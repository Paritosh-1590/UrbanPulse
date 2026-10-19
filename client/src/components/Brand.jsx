import { Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Brand({ light = false }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="UrbanPulse home">
      <span className="brand-mark"><Activity size={19} strokeWidth={2.6} /></span>
      <span>urban<span className="brand-accent">pulse</span></span>
    </Link>
  )
}
