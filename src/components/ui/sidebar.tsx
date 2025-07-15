"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button, type ButtonProps } from "@/components/ui/button"

interface SidebarContextProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)

  React.useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
  {
    variants: {
      isOpen: {
        true: "w-64",
        false: "w-16",
      },
    },
    defaultVariants: {
      isOpen: true,
    },
  }
)

function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  const { isOpen } = useSidebar()
  return (
    <aside
      className={cn(sidebarVariants({ isOpen }), className)}
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex h-16 items-center border-b p-4", className)}
      {...props}
    />
  )
}

function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center border-t p-4", className)}
      {...props}
    />
  )
}

const sidebarInsetVariants = cva("transition-all duration-300 ease-in-out", {
  variants: {
    isOpen: {
      true: "md:pl-64",
      false: "md:pl-16",
    },
  },
  defaultVariants: {
    isOpen: true,
  },
})

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  const { isOpen, isMobile } = useSidebar()
  if (isMobile) return <div {...props} />
  return <div className={cn(sidebarInsetVariants({ isOpen }), className)} {...props} />
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav className={cn("flex flex-col gap-1 p-4", className)} {...props} />
  )
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("relative", className)} {...props} />
}

interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      className,
      children,
      isActive,
      tooltip,
      asChild,
      ...props
    },
    ref
  ) => {
    const { isOpen } = useSidebar()

    const buttonContent = (
      <>
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap transition-all",
            isOpen ? "w-full" : "w-0"
          )}
        >
          {children}
        </span>
        {!isOpen && <span className="sr-only">{children}</span>}
      </>
    )
    
    const ButtonComponent = asChild ? 'div' : Button;

    const button = (
       <Button
        ref={ref}
        variant={isActive ? "secondary" : "ghost"}
        className={cn("h-12 justify-start", className)}
        asChild={asChild}
        {...props}
      >
        {children}
      </Button>
    )

    if (!isOpen && tooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isOpen, setIsOpen, isMobile } = useSidebar()

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("md:hidden", className)}
        {...props}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(className)}
      {...props}
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <ChevronsLeft /> : <ChevronsRight />}
    </Button>
  )
}

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
}
