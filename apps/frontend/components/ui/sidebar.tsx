"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// --- Context ---
type SidebarContextProps = {
  isCollapsed: boolean
  isMobile: boolean
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// --- Provider ---
interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapsible?: boolean
}

function SidebarProvider({ children, defaultCollapsed = false, collapsible = true }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsible ? defaultCollapsed : false)
  const [isOpen, setIsOpen] = React.useState(false)

  const isMobile = /Mobi/i.test(typeof window !== "undefined" ? window.navigator.userAgent : "")

  const toggle = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev)
    } else {
      setIsCollapsed((prev) => !prev)
    }
  }

  React.useEffect(() => {
    const handleResize = () => {
      if (!isMobile) {
        setIsOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobile, isOpen, setIsOpen, toggle }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

// --- Sidebar ---
const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed, isMobile, isOpen, setIsOpen } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex h-full flex-col" {...props} />
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        data-collapsed={isCollapsed}
        className={cn(
          "group peer hidden lg:flex flex-col h-screen transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
        {...props}
      />
    )
  },
)
Sidebar.displayName = "Sidebar"

// --- Header ---
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center h-14 px-4 border-b", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

// --- Content ---
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)} {...props} />
  ),
)
SidebarContent.displayName = "SidebarContent"

// --- Footer ---
const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-4 border-t mt-auto", className)} {...props} />,
)
SidebarFooter.displayName = "SidebarFooter"

// --- Main Content Wrapper ---
const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out lg:ml-64 peer-data-[collapsed=true]:lg:ml-16",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"

// --- Trigger ---
const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { toggle } = useSidebar()
    return (
      <Button ref={ref} variant="ghost" size="icon" className={cn("lg:hidden", className)} onClick={toggle} {...props}>
        <PanelLeft />
        <span className="sr-only">Toggle Menu</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

// --- Menu Components ---
const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { label?: string }>(
  ({ className, label, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    return (
      <div ref={ref} className={cn("p-2", className)} {...props}>
        {label && !isCollapsed && (
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1">{label}</h2>
        )}
        {children}
      </div>
    )
  },
)
SidebarGroup.displayName = "SidebarGroup"

const sidebarMenuButtonVariants = cva(
  "flex items-center justify-start w-full text-left rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
      },
    },
  },
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, active, asChild = false, tooltip, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    const Comp = asChild ? Slot : "button"

    const buttonNode = (
      <Comp
        className={cn(
          sidebarMenuButtonVariants({ active }),
          "group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )

    if (isCollapsed && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonNode}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonNode
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarMenuButton,
  useSidebar,
}
