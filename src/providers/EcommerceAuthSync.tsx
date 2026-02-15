'use client'

import React, { useEffect, useRef } from 'react'

import { useAuth } from '@/providers/Auth'
import { useEcommerce } from '@payloadcms/plugin-ecommerce/client/react'

/**
 * Keeps EcommerceProvider's user in sync with AuthProvider.
 * The ecommerce plugin uses its own user state for createAddress/updateAddress;
 * if the user logs in via AuthProvider, the plugin never gets the user until
 * onLogin() is called. This component calls onLogin/onLogout when auth state
 * changes so address (and cart) actions work for logged-in users.
 */
export const EcommerceAuthSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth()
  const { onLogin, onLogout } = useEcommerce()
  const prevAuthUser = useRef<unknown>(undefined)

  useEffect(() => {
    if (authUser) {
      if (!prevAuthUser.current) {
        void onLogin()
      }
    } else {
      if (prevAuthUser.current) {
        onLogout()
      }
    }
    prevAuthUser.current = authUser
  }, [authUser, onLogin, onLogout])

  return <>{children}</>
}
