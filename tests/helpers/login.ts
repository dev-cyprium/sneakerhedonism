import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { BASE_URL } from './constants'

/**
 * Logs the user in via the frontend /login page.
 */
export async function loginFromUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${BASE_URL}/login`)
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/\/account/)
}

/**
 * Logs the user in via the admin /admin/login page.
 */
export async function loginToAdmin(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${BASE_URL}/admin/login`)
  await page.fill('#field-email', email)
  await page.fill('#field-password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}/admin`)
  await expect(page.getByText('Welcome to your dashboard!')).toBeVisible({ timeout: 15000 })
}

/**
 * Navigates to /logout and verifies the user is logged out.
 */
export async function logout(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/logout`)
  const heading = page.locator('h1').first()
  await expect(heading).toContainText(/logged out/i)
}
