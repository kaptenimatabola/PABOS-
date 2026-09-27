import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"PABOS EDUOS | School Operating System",description:"Secure, multi-tenant digital operating system for African schools."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}