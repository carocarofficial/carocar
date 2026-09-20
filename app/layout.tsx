import './globals.css';
import Link from 'next/link';
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body><header className="nav"><div className="container navin"><Link className="brand" href="/">car<span>Ocar</span></Link><nav className="links"><Link href="/buy">Buy</Link><Link href="/sell">Sell</Link><Link href="/rent">Rent</Link><Link href="/saathi">Saathi</Link><Link href="/services">Services</Link><Link href="/account">Account</Link></nav><Link className="btn primary" href="/login">Login</Link></div></header>{children}</body></html>}
