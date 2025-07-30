
"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from 'next/link';

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  collapsedWidth: string;
  expandedWidth: string;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  collapsedWidth = "70px",
  expandedWidth = "300px"
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  collapsedWidth?: string,
  expandedWidth?: string
}) => {
  const [openState, setOpenState] = useState(false);

  const openToUse = open !== undefined ? open : openState;
  const setOpenToUse = setOpen !== undefined ? setOpen : setOpenState;

  return (
    <SidebarContext.Provider value={{ open: openToUse, setOpen: setOpenToUse, animate: animate ?? true, collapsedWidth, expandedWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate, collapsedWidth, expandedWidth } = useSidebar();
  return (
    <motion.div
        className={cn(
          "h-screen px-4 py-10 hidden md:flex md:flex-col bg-card/50 backdrop-blur-lg border-r border-border shrink-0 sticky top-0 rounded-r-lg",
          className
        )}
        animate={{
          width: animate ? (open ? expandedWidth : collapsedWidth) : expandedWidth,
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-card/80 backdrop-blur-lg w-full sticky top-0 z-50 border-b"
        )}
        {...props}
      >
        <div className="flex justify-start items-center">
            <LogoIcon />
        </div>
        <button className="p-2 rounded-md hover:bg-secondary" onClick={() => setOpen(!open)}>
          <Menu
            className="text-foreground"
          />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed top-0 left-0 w-full bg-card/80 backdrop-blur-lg z-[100] border-b rounded-b-lg",
                "flex flex-col",
                className
              )}
            >
                <div className="flex justify-between items-center p-4">
                    <LogoIcon />
                    <button className="p-2 rounded-md hover:bg-secondary" onClick={() => setOpen(false)}>
                        <X className="text-foreground" />
                    </button>
                </div>
                <div className="p-4 flex flex-col">
                 {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                      return React.cloneElement(child as React.ReactElement<any>, {
                        className: cn(
                          (child.props.className || ''),
                          'flex flex-col gap-4'
                        )
                      });
                    }
                    return child;
                  })}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  [key: string]: any;
}) => {
  const { open } = useSidebar();
  const isSelected = className?.includes('bg-secondary');

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-4 group/sidebar transition-colors duration-200 rounded-lg h-14 relative",
        !isSelected && "hover:bg-secondary/50",
        className
      )}
      {...props}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute left-0 top-0 h-full bg-secondary rounded-lg z-0"
            initial={false}
            animate={{
              width: open ? '100%' : '56px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </AnimatePresence>
      <div className="w-14 h-14 flex items-center justify-center shrink-0 z-10">
        {link.icon}
      </div>

      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          x: open ? 0 : -10
        }}
        transition={{
          duration: 0.2,
          delay: 0.1
        }}
        className="text-foreground text-sm whitespace-pre overflow-hidden z-10"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};


export const Logo = () => {
  const { open } = useSidebar();
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <motion.div
        layout
        className="h-5 w-6 bg-primary dark:bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" 
      />
      <AnimatePresence>
        {open && (
           <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1}}
            className="font-headline font-medium text-foreground dark:text-white whitespace-pre text-lg"
          >
            Amore Eterno
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-primary dark:bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
