import React from 'react'
import "@/app/globals.css";
import { Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Ethiopic } from "next/font/google";


const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Carries the ትንሳኤ wordmark that appears in the logo, stat band and CTA.
const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
});


const Layout = ({children}:{children:React.ReactNode}) => {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrains.variable} ${ethiopic.variable} h-full antialiased`}
    >
        <body>
            {children}
        </body>
    </html>
  )
}
export default Layout