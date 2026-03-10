export const BASE_URL = 'http://localhost:3000'

// ─── Users ────────────────────────────────────────────────────────

export const ADMIN_USER = {
  email: 'e2e-admin@test.com',
  password: 'e2e-admin-pass',
}

export const CUSTOMER_USER = {
  email: 'e2e-customer@test.com',
  password: 'e2e-customer-pass',
}

// ─── Variant Type & Options ───────────────────────────────────────

export const VARIANT_TYPE = {
  name: 'e2e-brand',
  label: 'Brand',
}

export const VARIANT_OPTIONS = {
  alpha: { label: 'Alpha', value: 'e2e-alpha' },
  beta: { label: 'Beta', value: 'e2e-beta' },
}

// ─── Products ─────────────────────────────────────────────────────

export const SIMPLE_PRODUCT = {
  title: 'E2E Simple Product',
  slug: 'e2e-simple-product',
  priceInRSD: 2500,
  inventory: 100,
}

export const VARIANT_PRODUCT = {
  title: 'E2E Variant Product',
  slug: 'e2e-variant-product',
  priceInRSD: 4999,
}

export const NO_INVENTORY_PRODUCT = {
  title: 'E2E No Inventory Product',
  slug: 'e2e-no-inventory-product',
  inventory: 0,
}

// ─── Address ──────────────────────────────────────────────────────

export const TEST_ADDRESS = {
  firstName: 'Test',
  lastName: 'Admin',
  phone: '+381601234567',
  addressLine1: 'Test Street 1',
  city: 'Belgrade',
  postalCode: '11000',
  country: 'RS' as const,
}

// ─── Serbian UI text ──────────────────────────────────────────────

export const UI = {
  addToCart: 'Dodaj u korpu',
  continueShopping: 'Nastavi kupovinu',
  cartLabel: 'Korpa',
  emptyCart: 'Vaša korpa je prazna.',
  reduceQuantity: 'Smanji količinu proizvoda',
  continueAsGuest: /nastavi kao gost/i,
  addAddress: /dodaj adresu/i,
  confirm: 'Potvrdi',
  selectAddress: 'Select an address',
  goToPayment: 'Na plaćanje',
  cashOnDelivery: 'Plaćanje pouzećem',
  cheapestFirst: /najjeftinije/i,
  findMyOrder: 'Find my order',
  accountCreated: 'Nalog je uspešno kreiran',
  accountSettings: 'Account settings',
  updateAccount: 'Update Account',
  accountUpdated: 'Successfully updated account.',
  orders: 'Orders',
}
