'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const BREAKPOINT = 768

// Đặt trong desktop layout/page — redirect sang mobile nếu màn hình nhỏ
// to: đích cố định (login); nếu không truyền → tự map /dashboard/* → /m/dashboard/*
export function ToMobileIfSmall({ children, to }: { children: React.ReactNode; to?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.innerWidth <= BREAKPOINT) {
      router.replace(to ?? pathname.replace(/^\/dashboard/, '/m/dashboard'))
    } else {
      setReady(true)
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null
  return <>{children}</>
}

// Đặt trong mobile layout/page — redirect sang desktop nếu màn hình lớn
// to: đích cố định (login); nếu không truyền → tự map /m/dashboard/* → /dashboard/*
export function ToDesktopIfLarge({ children, to }: { children: React.ReactNode; to?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.innerWidth > BREAKPOINT) {
      router.replace(to ?? pathname.replace(/^\/m\/dashboard/, '/dashboard'))
    } else {
      setReady(true)
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null
  return <>{children}</>
}
