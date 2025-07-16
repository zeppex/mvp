import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, BarChartBig, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">Zeppex</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/merchant/login">
                <Button variant="outline">Merchant Login</Button>
              </Link>
              <Link href="/admin/login">
                <Button>Admin Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-24 lg:py-32 xl:py-40 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Future of Crypto Payments is Here
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Zeppex provides a seamless, secure, and efficient QR code-based payment system for merchants and
                    customers worldwide.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/merchant/register">Get Started for Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  alt="Zeppex Payment Flow"
                  className="aspect-square overflow-hidden rounded-xl object-cover"
                  height="550"
                  src="/placeholder.svg?height=550&width=550"
                  width="550"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From instant transactions to detailed analytics, Zeppex offers a complete toolkit for modern commerce.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <QrCode className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-bold">QR Code Payments</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate dynamic QR codes for customers to scan and pay with their preferred cryptocurrency wallet.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <BarChartBig className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-bold">Real-time Analytics</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor transactions, track sales, and gain valuable insights with our comprehensive merchant
                  dashboard.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-bold">Secure & Reliable</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leverage our secure infrastructure for safe transactions and reliable payment processing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Zeppex. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
