'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import { SignOutButton } from '@/components/signout-button'

import { absoluteUrl } from '@/lib/utils'
import { useUserAPI } from '@/queries/client/users'

const AccountMenu = () => {
  const { t } = useTranslation()
  const { user } = useUserAPI()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="font-['Noto_Sans_KR'] text-lg font-medium text-black hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-xl transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm font-medium">
              {user?.full_name
                ?.split(' ')
                .map(name => name[0])
                .join('')
                .toUpperCase() || 'AC'}
            </AvatarFallback>
          </Avatar>
          {user?.full_name?.split(' ')[0] || user?.username || 'Account'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="grid font-normal">
          <span>{user?.full_name}</span>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/users/profile" className="cursor-pointer">
            {t('profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/account" className="cursor-pointer">
            {t('account')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/notifications" className="cursor-pointer">
            {t('notifications')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/emails" className="cursor-pointer">
            {t('emails')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/security" className="cursor-pointer">
            {t('password_and_authentication')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/appearance" className="cursor-pointer">
            {t('appearance')}
          </Link>
        </DropdownMenuItem>
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin" className="cursor-pointer">
                {t('admin')}
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOutButton
            variant="ghost"
            className="flex h-auto w-full justify-start p-0 font-normal"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AccountMenu }
