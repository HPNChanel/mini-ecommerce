import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { checkoutCart, confirmMockPayment, type CheckoutResponse } from "../api/orders";
import { useCart } from "../hooks/useCart";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { showSuccessToast } from "../lib/toast";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Enter a valid phone number"),
  line1: z.string().min(4, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State or region is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  notes: z.string().optional()
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type PaymentStatus = "idle" | "authorizing" | "confirming" | "success" | "error";

export function CheckoutPage(): JSX.Element {
  const { cart, isLoading, clear } = useCart();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      notes: ""
    }
  });

  useEffect(() => {
    if (!isLoading && (!cart || cart.items.length === 0)) {
      navigate("/cart");
    }
  }, [cart, isLoading, navigate]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-4xl justify-center px-4 py-20">
        <p className="text-slate-500">Your cart is empty.</p>
      </div>
    );
  }

  const handleSubmit = async (_values: CheckoutValues) => {
    setPaymentError(null);
    if (!Number.isFinite(cart.id)) {
      setPaymentStatus("error");
      setPaymentError("Cart is unavailable. Please refresh and try again.");
      return;
    }
    setPaymentStatus("authorizing");
    try {
      const data = await checkoutCart(cart.id);
      setCheckoutData(data);
    } catch (error) {
      console.error(error);
      setPaymentStatus("error");
      setPaymentError("Unable to initiate payment. Please try again.");
    }
  };

  useEffect(() => {
    if (paymentStatus !== "authorizing" || !checkoutData) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setPaymentStatus("confirming");
      try {
        const order = await confirmMockPayment(checkoutData.paymentRef);
        setPaymentStatus("success");
        showSuccessToast("Payment confirmed. Thank you for your order!");
        await clear();
        navigate(`/orders/${order.id}`);
      } catch (error) {
        console.error(error);
        setPaymentStatus("error");
        setPaymentError("Payment confirmation failed. Please contact support.");
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [checkoutData, clear, navigate, paymentStatus]);

  const isPaymentProcessing = paymentStatus === "authorizing" || paymentStatus === "confirming";

  return (
    <div className="bg-slate-50">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr] md:px-6">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
            <p className="text-sm text-slate-500">Enter your shipping details to complete your order.</p>
          </div>
          <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" className="mt-2" {...form.register("fullName")} />
              {form.formState.errors.fullName ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-2" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" className="mt-2" {...form.register("phone")} />
                {form.formState.errors.phone ? (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.phone.message}</p>
                ) : null}
              </div>
            </div>
            <div>
              <Label htmlFor="line1">Address line 1</Label>
              <Input id="line1" className="mt-2" {...form.register("line1")} />
              {form.formState.errors.line1 ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.line1.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="line2">Address line 2</Label>
              <Input id="line2" className="mt-2" {...form.register("line2")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" className="mt-2" {...form.register("city")} />
                {form.formState.errors.city ? (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.city.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="state">State / Region</Label>
                <Input id="state" className="mt-2" {...form.register("state")} />
                {form.formState.errors.state ? (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.state.message}</p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" className="mt-2" {...form.register("postalCode")} />
                {form.formState.errors.postalCode ? (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.postalCode.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" className="mt-2" {...form.register("country")} />
                {form.formState.errors.country ? (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.country.message}</p>
                ) : null}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Textarea id="notes" className="mt-2" rows={4} {...form.register("notes")} />
            </div>
            <Button
              type="submit"
              className="mt-4 rounded-full py-3 text-base font-semibold"
              disabled={form.formState.isSubmitting || isPaymentProcessing}
            >
              {form.formState.isSubmitting || isPaymentProcessing ? "Processing…" : `Pay $${cart.total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="space-y-3 text-sm text-slate-600">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{item.product.name}</p>
                  <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
          {paymentStatus === "idle" ? (
            <p className="text-xs text-slate-500">Payments are securely simulated for this demo experience.</p>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">Mock payment widget</p>
              <p className="mt-1 text-xs text-slate-500">
                {paymentStatus === "authorizing"
                  ? "Authorizing your payment..."
                  : paymentStatus === "confirming"
                    ? "Confirming payment with the provider..."
                    : paymentStatus === "success"
                      ? "Payment successful!"
                      : "Payment failed."}
              </p>
              {checkoutData ? (
                <div className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-500">
                  <p>
                    <span className="font-semibold text-slate-900">Payment reference:</span> {checkoutData.paymentRef}
                  </p>
                  <p className="mt-1 break-all">
                    <span className="font-semibold text-slate-900">Client secret:</span> {checkoutData.clientSecret}
                  </p>
                </div>
              ) : null}
              {paymentError ? <p className="mt-3 text-xs text-red-500">{paymentError}</p> : null}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
