'use client'
import Link from "next/link"
import { Button } from "../ui/button"
import React, { use, useCallback, useEffect, useState } from "react"
import { Account } from "@/app/auth/hooks/authContext"
import { useAuth } from "@/app/auth/hooks/authState"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { NavigationMenuList, NavigationMenuTrigger } from "@radix-ui/react-navigation-menu"
import { Navigation } from "lucide-react"
import { DropdownMenuDemo } from "./menu"
import { usePathname } from "next/navigation"
import { v4 as uuidv4 } from 'uuid';

interface Prop {
  children: React.ReactNode
}
const OAUTH = process.env.NEXT_PUBLIC_OAUTH;
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
export const NavBar: React.FC<Prop> = ({ children }) => {
  const [state, setState] = useState<string>();
  const url = usePathname();
  const enableNav = [
    {
      path: '/auth/login',
      enable: false
    },
    {
      path: '/auth/register',
      enable: false
    },
    {
      path: '/',
      enable: true
    }
  ]
  
  const { account, logout } = useAuth();

  const handleSignInClick = useCallback(() => {
    const newState = uuidv4();
    localStorage.setItem('oauth_state', newState);
    window.location.href = `${OAUTH}/auth/login?redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&scope=dev&state=${newState}&response_type=code`;
  }, [OAUTH, REDIRECT_URI, CLIENT_ID]);

  return (
    <div>
      {enableNav.find((item) => item.path === url)?.enable && <nav className="flex items-center justify-between p-4 border-b">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <span>Lab Tools</span>
        </Link>
        {account.email !== "" ? <div className="flex items-center gap-6">
          <DropdownMenuDemo account={account} logout={logout}></DropdownMenuDemo>

        </div> : <div className="flex items-center gap-6">
          {/* <Link
            href={`${OAUTH}/auth/login?redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&scope=dev&state=${state}&response_type=code`}
            rel="noopener noreferrer"
          > */}
            <Button size="default" onClick={handleSignInClick}>
              {/* <Github className="h-5 w-5" /> */}
              Sign In
            </Button>
          {/* </Link> */}
          <Link href={`${OAUTH}/auth/register`}>
            <Button variant="outline" size="default">
              {/* <Mail className="h-5 w-5" /> */}
              Sign Up
            </Button>
          </Link>
        </div>}

      </nav>}
      {children}
    </div>
  )
}