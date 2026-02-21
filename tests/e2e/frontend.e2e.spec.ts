import { test, expect, Page } from '@playwright/test'
import {
  ADMIN_USER,
  CUSTOMER_USER,
  SIMPLE_PRODUCT,
  VARIANT_PRODUCT,
  NO_INVENTORY_PRODUCT,
  VARIANT_OPTIONS,
  BASE_URL,
  UI,
} from '../helpers/constants'
import { loginFromUI, logout } from '../helpers/login'

test.describe('Frontend', () => {
  // ─── Basic pages ────────────────────────────────────────────────

  test('can go on homepage', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/.+/)
  })

  // ─── Auth flow ──────────────────────────────────────────────────

  test('can sign up and subsequently login', async ({ page }) => {
    await logout(page)

    await page.goto(`${BASE_URL}/create-account`)

    const email = `test-${Date.now()}@test.com`
    const password = 'test'

    await page.locator('input[name="email"]').fill(email)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('input[name="passwordConfirm"]').fill(password)

    await page.locator('button[type="submit"]').click()

    await page.waitForURL(/\/account/)
    await expect(page.getByText(UI.accountCreated)).toBeVisible()

    await logout(page)
    await loginFromUI(page, email, password)
  })

  // ─── Cart ───────────────────────────────────────────────────────

  test('can add products to cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })
  })

  test('can add product with variant to cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: VARIANT_PRODUCT.title,
      productSlug: VARIANT_PRODUCT.slug,
      variant: VARIANT_OPTIONS.alpha.label,
    })
  })

  test('can remove products from cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })

    await removeFromCartAndConfirm(page)
  })

  test('can remove products with variants from cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: VARIANT_PRODUCT.title,
      productSlug: VARIANT_PRODUCT.slug,
      variant: VARIANT_OPTIONS.alpha.label,
    })

    await removeFromCartAndConfirm(page)
  })

  test('should retain cart content on hard refresh', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })

    // Close the cart sheet
    await page.keyboard.press('Escape')

    await page.reload()

    // Wait for cart badge to appear after hydration
    const cartBadge = page.locator(`button[aria-label="${UI.cartLabel}"]`)
    const quantityBadge = cartBadge.locator('span')
    await expect(quantityBadge).toBeVisible({ timeout: 10000 })
    await cartBadge.click()

    const productInCart = page.getByRole('dialog').getByText(SIMPLE_PRODUCT.title)
    await expect(productInCart).toBeVisible()
  })

  // ─── Shop & sort ────────────────────────────────────────────────

  test('can view and sort via shop page', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`)

    const productCard = page.locator(`a[href="/products/${SIMPLE_PRODUCT.slug}"]`).first()
    await productCard.waitFor({ state: 'visible' })
    await expect(productCard).toBeVisible()

    // Open sort dropdown and select "Cheapest first"
    const sortDropdown = page.locator('button[aria-haspopup="listbox"]').first()
    await sortDropdown.click()

    const sortOption = page.getByRole('option', { name: UI.cheapestFirst })
    await sortOption.click()
    await expect(page).toHaveURL(/\/shop\?.*sort=priceInRSD/)

    // Products should still be visible after sorting
    await expect(productCard).toBeVisible()
  })

  // ─── Account ────────────────────────────────────────────────────

  test('authenticated users can view account', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await page.goto(`${BASE_URL}/account`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText(UI.accountSettings)
  })

  test('authenticated users can update their name', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await page.goto(`${BASE_URL}/account`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText(UI.accountSettings)

    // Wait for form to hydrate and load user data before interacting
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveValue(ADMIN_USER.email, { timeout: 10000 })

    const nameInput = page.locator('input[name="name"]')
    await nameInput.fill(`E2E User ${Date.now()}`)

    const updateButton = page.getByRole('button', { name: UI.updateAccount })
    await expect(updateButton).toBeEnabled({ timeout: 5000 })
    await updateButton.click()

    await expect(page.getByText(UI.accountUpdated)).toBeVisible({ timeout: 10000 })
  })

  test('authenticated users can view orders page', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await page.goto(`${BASE_URL}/orders`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText(UI.orders)
  })

  // ─── Checkout (authenticated) ──────────────────────────────────

  test('authenticated users can view order details', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })
    await page.keyboard.press('Escape')

    await checkout(page)

    await expectOrderIsDisplayed(page)
  })

  // ─── Access control ─────────────────────────────────────────────

  test('authenticated customers cannot access /admin', async ({ page }) => {
    await loginFromUI(page, CUSTOMER_USER.email, CUSTOMER_USER.password)
    await page.goto(`${BASE_URL}/admin`)
    const heading = page.locator('h1').first()
    await expect(heading).toContainText('Unauthorized')
  })

  // ─── Guest checkout ─────────────────────────────────────────────

  test('Guest can create and view order', async ({ page }) => {
    await logout(page)
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })
    await page.keyboard.press('Escape')

    await checkout(page, 'guest@test.com')
    await expectOrderIsDisplayed(page)
  })

  test('Guest can view their order using /find-order', async ({ page }) => {
    await logout(page)
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })
    await page.keyboard.press('Escape')

    const guestEmail = 'guest@test.com'
    await checkout(page, guestEmail)

    const orderHeader = await page
      .locator('h1.text-sm.uppercase.font-mono > span')
      .textContent()
    const orderNumber = orderHeader?.replace(/^Order #/, '').trim()

    await page.goto(`${BASE_URL}/find-order`)
    await page.locator('input[name="orderID"]').fill(orderNumber || '')
    await page.locator('input[name="email"]').fill(guestEmail)

    await page.getByRole('button', { name: UI.findMyOrder }).click()

    await page.waitForURL(/\/orders\//)
  })

  // ─── Admin product management ──────────────────────────────────

  test('Admins can update and view prices on products', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await page.goto(`${BASE_URL}/admin/collections/products`)
    const testProductLink = page.getByRole('link', { name: SIMPLE_PRODUCT.title, exact: true })
    await testProductLink.click()

    const productDetailsButton = page.getByRole('button', { name: 'Product Details' })
    await productDetailsButton.click()

    const priceInput = page.locator('input.formattedPriceInput[placeholder="0.00"]')
    await priceInput.fill('20.00')

    await saveAndConfirmSuccess(page)
  })

  test('Admins can update and view prices on variants', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await page.goto(`${BASE_URL}/admin/collections/variants`)
    const variantLink = page.getByRole('link', {
      name: `${VARIANT_PRODUCT.title} — ${VARIANT_OPTIONS.alpha.label}`,
      exact: true,
    })
    await variantLink.click()

    const variantPriceInput = page.locator('input.formattedPriceInput[placeholder="0.00"]').first()
    await variantPriceInput.fill('25.00')

    await saveAndConfirmSuccess(page)
  })

  test('Admins can create new products with new variants', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await page.goto(`${BASE_URL}/admin/collections/products/create`)
    const titleInput = page.locator('input#field-title')
    await titleInput.fill('New Product with Variants')
    // Slug auto-generates from title ("new-product-with-variants")
    const chooseFromExistingButton = page.getByRole('button', { name: 'Choose from existing' })
    await chooseFromExistingButton.click()
    const firstFileButton = page.locator('button.default-cell__first-cell').first()
    await firstFileButton.click()

    const productDetailsButton = page.getByRole('button', { name: 'Product Details' })
    await productDetailsButton.click()

    const enableVariantsCheckbox = page.locator('input#field-enableVariants')
    await enableVariantsCheckbox.check()

    // create a new variant type
    const addNewVariantTypeButton = page.locator(
      'button.relationship-add-new__add-button.doc-drawer__toggler[aria-label="Add new Variant Type"]',
    )
    await addNewVariantTypeButton.click()

    const variantTypeNameInput = page.locator('input#field-name')
    await variantTypeNameInput.fill('Pattern')
    const variantTypeLabelInput = page.locator('input#field-label')
    await variantTypeLabelInput.fill('Pattern')

    const saveButton = page.getByRole('button', { name: 'Save', exact: true })
    await saveButton.click()

    // create a new variant option
    const createVariantOptionButton = page.getByRole('button', {
      name: 'Create new Variant Option',
      exact: true,
    })
    await createVariantOptionButton.click()

    const variantOptionValueInput = page.locator('input#field-value')
    await variantOptionValueInput.fill('striped')
    const variantOptionLabelInput = page
      .getByRole('dialog', { name: /variantOptions/i })
      .locator('input#field-label')
    await variantOptionLabelInput.fill('Striped')
    await saveButton.nth(1).click()

    const closeButton = page.getByRole('button', { name: 'Close' }).nth(1)
    await closeButton.click()

    const publishChangesButton = page.getByRole('button', { name: 'Publish changes' })
    await publishChangesButton.click()

    await page.goto(`${BASE_URL}/shop`)
    const newProductCard = page.locator(`a[href="/products/new-product-with-variants"]`).first()
    await newProductCard.waitFor({ state: 'visible' })
    await expect(newProductCard).toBeVisible()
  })

  test('Admins can view transactions and orders', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)
    await addToCartAndConfirm(page, {
      productName: SIMPLE_PRODUCT.title,
      productSlug: SIMPLE_PRODUCT.slug,
    })
    await page.keyboard.press('Escape')
    await checkout(page)
    await expectOrderIsDisplayed(page)
    const orderHeader = await page.locator('h1.text-sm.uppercase.font-mono > span').textContent()
    const orderNumber = orderHeader?.replace(/^Order #/, '').trim()

    await page.goto(`${BASE_URL}/admin/collections/orders`)
    const rowCount = await page.locator('div.table table tbody tr').count()
    expect(rowCount).toBeGreaterThan(0)

    await page.goto(`${BASE_URL}/admin/collections/orders/${orderNumber}`)
    const product = page.locator('div.rs__control', { hasText: SIMPLE_PRODUCT.title })
    await expect(product).toBeVisible()

    await page.goto(`${BASE_URL}/admin/collections/transactions`)
    const transactionRows = await page.locator('div.table table tbody tr').count()
    expect(transactionRows).toBeGreaterThan(0)
  })

  // ─── Inventory ──────────────────────────────────────────────────

  test('should disable add to cart when product has no inventory', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/${NO_INVENTORY_PRODUCT.slug}`)
    const addToCartButton = page.getByRole('button', { name: UI.addToCart })
    await expect(addToCartButton).toBeDisabled()
  })

  // This test fails, it should not let you checkout but it does
  test.skip('should fail checkout when inventory is 0', async ({ page }) => {
    await loginFromUI(page, ADMIN_USER.email, ADMIN_USER.password)

    // update inventory to 1
    await page.goto(`${BASE_URL}/admin/collections/products`)
    const testProductLink = page.getByRole('link', {
      name: NO_INVENTORY_PRODUCT.title,
      exact: true,
    })
    await testProductLink.click()
    const productDetailsButton = page.getByRole('button', { name: 'Product Details' })
    await productDetailsButton.click()
    const inventoryInput = page.locator('input[name="inventory"]')
    await inventoryInput.fill('1')
    await saveAndConfirmSuccess(page)

    await page.goto(`${BASE_URL}/products/${NO_INVENTORY_PRODUCT.slug}`)
    const addToCartButton = page.getByRole('button', { name: UI.addToCart })
    await expect(addToCartButton).toBeVisible()
    await addToCartButton.click()

    // update inventory to 0
    await page.goto(`${BASE_URL}/admin/collections/products`)
    await testProductLink.click()
    await productDetailsButton.click()
    await inventoryInput.fill('')
    await saveAndConfirmSuccess(page)

    await checkout(page)
    const errorMessage = page.locator('text=This product is out of stock')
    await expect(errorMessage).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════════════
  //  Helper functions
  // ═══════════════════════════════════════════════════════════════

  async function addToCartAndConfirm(
    page: Page,
    {
      productName,
      productSlug,
      variant,
    }: {
      productName: string
      productSlug: string
      variant?: string
    },
  ) {
    await page.goto(`${BASE_URL}/products/${productSlug}`)

    if (variant) {
      const variantButton = page.getByRole('button', { name: variant })
      await variantButton.waitFor({ state: 'visible' })
      await variantButton.click()
    }

    const addToCartButton = page.getByRole('button', { name: UI.addToCart })
    await expect(addToCartButton).toBeEnabled({ timeout: 10000 })
    await addToCartButton.click()

    // Dismiss "Proizvod je dodat u korpu" confirmation dialog
    const continueShoppingBtn = page.getByRole('button', { name: UI.continueShopping })
    await expect(continueShoppingBtn).toBeVisible()
    await continueShoppingBtn.click()

    // Open cart sheet via the bag icon
    const cartBadge = page.locator(`button[aria-label="${UI.cartLabel}"]`)
    await cartBadge.click()

    // Verify the product appears inside the cart sheet
    const productInCart = page.getByRole('dialog').getByText(productName, { exact: false })
    await expect(productInCart).toBeVisible()
  }

  async function removeFromCartAndConfirm(page: Page) {
    const reduceQuantityButton = page.getByRole('button', { name: UI.reduceQuantity })
    await expect(reduceQuantityButton).toBeVisible()
    await reduceQuantityButton.click()

    const emptyCartMessage = page.getByText(UI.emptyCart)
    await expect(emptyCartMessage).toBeVisible()
  }

  async function checkout(page: Page, guestEmail?: string | null): Promise<void> {
    await page.goto(`${BASE_URL}/checkout`)

    if (guestEmail) {
      // Guest flow: provide email, create a temporary address
      const emailInput = page.locator('input#email')
      await emailInput.fill(guestEmail)

      const continueGuestBtn = page.getByRole('button', { name: UI.continueAsGuest })
      await continueGuestBtn.click()

      // Open the address modal
      const addAddressBtn = page.getByRole('button', { name: UI.addAddress })
      await expect(addAddressBtn).toBeEnabled({ timeout: 5000 })
      await addAddressBtn.click()

      // Fill compact address form inside the modal
      await page.locator('input#firstName').fill('Test')
      await page.locator('input#lastName').fill('Guest')
      await page.locator('input#phone').fill('+381601234567')
      await page.locator('input#addressLine1').fill('Guest Street 1')
      await page.locator('input#city').fill('Belgrade')
      await page.locator('input#postalCode').fill('11000')

      const confirmBtn = page.getByRole('button', { name: UI.confirm })
      await confirmBtn.click()
    } else {
      // Authenticated user: address may already be auto-selected
      const selectBtn = page.getByRole('button', { name: UI.selectAddress })
      const paymentBtn = page.getByRole('button', { name: UI.goToPayment })

      // Wait for checkout to be ready (either address picker or payment button)
      await expect(paymentBtn.or(selectBtn)).toBeVisible({ timeout: 10000 })

      if (await selectBtn.isVisible()) {
        await selectBtn.click()
        const selectAddress = page.getByRole('button', { name: 'Select' }).first()
        await selectAddress.click()
      }
    }

    // Proceed to payment section
    const goToPayment = page.getByRole('button', { name: UI.goToPayment })
    await expect(goToPayment).toBeEnabled({ timeout: 5000 })
    await goToPayment.click()

    // Choose Cash on Delivery (card payments are temporarily disabled)
    const codButton = page.locator('button', { hasText: UI.cashOnDelivery })
    await codButton.click()

    // Wait for redirect to order page
    await page.waitForURL(/\/orders\//, { timeout: 30000 })
  }

  async function expectOrderIsDisplayed(page: Page): Promise<void> {
    const orderHeader = await page
      .locator('h1.text-sm.uppercase.font-mono > span')
      .textContent()
    expect(orderHeader).toContain('Order #')

    const orderNumber = orderHeader?.replace(/^Order #/, '').trim()
    const pageURL = page.url()

    expect(pageURL).toContain(`/orders/${orderNumber}`)
  }

  async function saveAndConfirmSuccess(page: Page) {
    const saveButton = page.locator('#action-save')
    await saveButton.click()

    const successMessage = page.locator('text=Updated successfully')
    await expect(successMessage).toBeVisible()
  }
})
