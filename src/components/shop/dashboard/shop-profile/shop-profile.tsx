"use client"
import React from "react"
import ProfileForm from "./profile-form"
import ContactForm from "./contact-form"
import { Box, Image, MapPin, MessageCircle, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


type Nav = {
  text: string;
  href: string;
  icon?: LucideIcon;
}
const navs: Nav[] = [
  { text: "shop profile", href: "/shop/dashboard/shop-profile", icon: User },
  { text: "location & hour", href: "#", icon: MapPin },
  { text: "Photos", href: "#", icon: Image },
  { text: "Categories", href: "#", icon: Box },
  { text: "Teams", href: "#", icon: MessageCircle }
]

export default function ShopProfile() {
  const pathname = usePathname()
  return (
    <div className="grid md:grid-cols-3 md:p-10">
      <div className="md:flex flex-col gap-4 md:px-10 hidden ">
        {
          navs.map(({ text, href, icon: Icon }) => {
            const isActive = href === pathname;
            return (
              <Link key={text} href={href} className={`flex items-center px-3 py-1 gap-2 ${isActive ? "bg-red-100 rounded-full" : ""}`}>
                {Icon ? <Icon size={15} /> : null}
                <span className="font-bold text-lg">{text}</span>
              </Link>)
          })
        }
      </div>
      <div className="flex flex-col gap-5 col-span-2">
        <ProfileForm />
        <ContactForm />
      </div>
    </div>
  )
}