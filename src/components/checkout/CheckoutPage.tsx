'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { resolveItemPrice } from '@/lib/resolvePrice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Address, Product, VariantOption } from '@/payload-types'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressItem } from '@/components/addresses/AddressItem'
import { FormItem } from '@/components/forms/FormItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Truck, CreditCard } from 'lucide-react'

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const { initiatePayment, confirmOrder } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const cartTotal = useMemo(() => {
    if (!cart?.items?.length) return 0
    return cart.items.reduce((total, item) => {
      if (typeof item.product !== 'object' || !item.product || !item.quantity) return total
      const isVariant = Boolean(item.variant) && typeof item.variant === 'object'
      const price = resolveItemPrice(item.product, item.variant)
      return total + (price ?? 0) * item.quantity
    }, 0)
  }, [cart?.items])

  const canGoToPayment = Boolean(
    (email || user) &&
      billingAddress &&
      billingAddress.phone &&
      (billingAddressSameAsShipping || (shippingAddress && shippingAddress.phone)),
  )

  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const handleCodPayment = useCallback(async () => {
    setProcessingPayment(true)
    setError(null)

    try {
      const paymentData = (await initiatePayment('cod', {
        additionalData: {
          ...(email ? { customerEmail: email } : {}),
          billingAddress,
          shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
        },
      })) as Record<string, unknown>

      if (!paymentData?.transactionID) {
        throw new Error('Failed to initiate order.')
      }

      const confirmResult = (await confirmOrder('cod', {
        additionalData: {
          transactionID: paymentData.transactionID,
          ...(email ? { customerEmail: email } : {}),
          shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
        },
      })) as Record<string, unknown>

      if (confirmResult?.orderID) {
        clearCart()
        const redirectUrl = `/orders/${confirmResult.orderID}${email ? `?email=${email}` : ''}`
        router.push(redirectUrl)
      } else {
        throw new Error('Failed to confirm order.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      toast.error(msg)
      setProcessingPayment(false)
    }
  }, [
    initiatePayment,
    confirmOrder,
    email,
    billingAddress,
    billingAddressSameAsShipping,
    shippingAddress,
    clearCart,
    router,
  ])

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Obrađujemo vašu porudžbinu...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>Your cart is empty.</p>
        <Link href="/search">Continue shopping?</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">Contact</h2>
        {!user && (
          <div className=" bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">or</span>
                <Link href="/create-account">create an account</Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4 ">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                Not you?{' '}
                <Link className="underline" href="/logout">
                  Log out
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">Enter your email to checkout as a guest.</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
              >
                Continue as guest
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">Address</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              actions={
                <Button
                  variant={'outline'}
                  disabled={isProcessingPayment}
                  onClick={(e) => {
                    e.preventDefault()
                    setBillingAddress(undefined)
                  }}
                >
                  Remove
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address)
            }}
            skipSubmission={true}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={isProcessingPayment || (!user && (!email || Boolean(emailEditable)))}
            onCheckedChange={(state) => {
              setBillingAddressSameAsShipping(state as boolean)
            }}
          />
          <Label htmlFor="shippingTheSameAsBilling">Shipping is the same as billing</Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      disabled={isProcessingPayment}
                      onClick={(e) => {
                        e.preventDefault()
                        setShippingAddress(undefined)
                      }}
                    >
                      Remove
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading="Shipping address"
                description="Please select a shipping address."
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => {
                  setShippingAddress(address)
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </>
        )}

        {!showPayment && (
          <Button
            className="self-start"
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault()
              setShowPayment(true)
            }}
          >
            Go to payment
          </Button>
        )}

        {error && (
          <div className="my-4">
            <Message error={error} />
          </div>
        )}

        {showPayment && (
          <div className="pb-16">
            <h2 className="font-medium text-3xl mb-6">Payment method</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  void handleCodPayment()
                }}
                disabled={isProcessingPayment}
                className="flex items-center gap-4 p-5 rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-lg">Plaćanje pouzećem</p>
                  <p className="text-sm text-primary/60">
                    Platite kuriru prilikom preuzimanja paketa
                  </p>
                </div>
                {isProcessingPayment ? (
                  <LoadingSpinner />
                ) : (
                  <span className="text-sm font-medium text-primary/80">Izaberi</span>
                )}
              </button>

              <div className="flex items-center gap-4 p-5 rounded-lg border-2 border-primary/10 opacity-50">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-lg">Kartica</p>
                  <p className="text-sm text-primary/60">Uskoro dostupno</p>
                </div>
                <span className="text-xs font-medium bg-primary/10 px-3 py-1 rounded-full">
                  Uskoro
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="self-start mt-4"
              disabled={isProcessingPayment}
              onClick={() => setShowPayment(false)}
            >
              Back
            </Button>
          </div>
        )}
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
          <h2 className="text-3xl font-medium">Your cart</h2>
          {cart?.items?.map((item, index) => {
            if (typeof item.product === 'object' && item.product) {
              const {
                product,
                product: { id, meta, title, gallery },
                quantity,
                variant,
              } = item

              if (!quantity) return null

              let image = gallery?.[0]?.image || meta?.image
              const price = resolveItemPrice(product, variant)

              const isVariant = Boolean(variant) && typeof variant === 'object'

              if (isVariant) {
                const imageVariant = product.gallery?.find(
                  (item: NonNullable<Product['gallery']>[number]) => {
                    if (!item.variantOption) return false
                    const variantOptionID =
                      typeof item.variantOption === 'object'
                        ? item.variantOption.id
                        : item.variantOption

                    const hasMatch = variant?.options?.some(
                      (option: number | VariantOption) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      },
                    )

                    return hasMatch
                  },
                )

                if (imageVariant && typeof imageVariant.image !== 'string') {
                  image = imageVariant.image
                }
              }

              return (
                <div className="flex items-start gap-4" key={index}>
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {image && typeof image !== 'string' && (
                      <Media
                        className="h-full w-full"
                        fill
                        imgClassName="rounded-lg object-contain"
                        resource={image}
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
                    <div>
                      <p className="font-medium text-lg">{title}</p>
                      {variant && typeof variant === 'object' && (
                        <p className="text-sm font-mono text-primary/50 tracking-widest">
                          {variant.options
                            ?.map((option: number | VariantOption) => {
                              if (typeof option === 'object') return option.label
                              return null
                            })
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        x{quantity}
                      </p>
                    </div>

                    {price != null && (
                      <Price className="font-medium" amount={price} />
                    )}
                  </div>
                </div>
              )
            }
            return null
          })}
          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase">Total</span>{' '}
            <Price className="text-3xl font-medium" amount={cartTotal} />
          </div>
        </div>
      )}
    </div>
  )
}
