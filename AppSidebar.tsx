"use client";

import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Home, LayoutDashboard, Target, MessageSquare, BarChart3, Radio, GitBranch, Settings, CreditCard, LogOut } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
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

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
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
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 h-screen px-4 py-4 hidden md:flex md:flex-col bg-background w-87.5 shrink-0 z-40",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "80px") : "280px",
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
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-sidebar border-b border-sidebar-border w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-sidebar-foreground cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-screen w-full inset-0 bg-sidebar p-10 z-100 flex flex-col",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-sidebar-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
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
  props?: any;
}) => {
  const { open, animate } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === link.href;

  return (
    <Link
      to={link.href}
      className={cn(
        "relative flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-all duration-300 overflow-hidden",
        isActive
          ? "bg-accent text-accent-foreground shadow-md font-bold"
          : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm",
        className
      )}
      {...props}
    >
      {/* Shining hover effect */}
      <div className="absolute inset-0 -translate-x-full group-hover/sidebar:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12" />

      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-300 whitespace-pre inline-block p-0! m-0! relative z-10"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

const menuItems: Links[] = [
  { label: "Home Page", icon: <Home size={24} />, href: "/" },
  { label: "Campaigns", icon: <Target size={24} />, href: "/campaigns" },
  // { label: "Social", icon: <MessageSquare size={24} />, href: "/social" }, // Commented out - Social page removed
  { label: "Analytics", icon: <BarChart3 size={24} />, href: "/analytics" },
  //{ label: "Tracking", icon: <Radio size={24} />, href: "/tracking" },//
  //{ label: "Attributions", icon: <GitBranch size={24} />, href: "/attributions" },//
];

const bottomMenuItems: Links[] = [
  //{ label: "Billing", icon: <CreditCard size={24} />, href: "/billing" },//
  { label: "Settings", icon: <Settings size={24} />, href: "/settings" },
];

function SidebarContent() {
  const navigate = useNavigate();
  const { refetch } = useSession();
  const { open } = useSidebar();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Error signing out");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  return (
    <SidebarBody>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
            <img
              src="/logo-48.png"
              alt="SociaTrack Logo"
              className="w-8 h-8 shrink-0"
            />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-lg font-bold text-foreground whitespace-nowrap"
            >
              SociaTrack
            </motion.span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {menuItems.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-sidebar-border">
          {bottomMenuItems.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
          <button
            onClick={handleSignOut}
            className={cn(
              "relative flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-all duration-300 overflow-hidden text-destructive hover:bg-destructive/10 hover:shadow-lg"
            )}
          >
            {/* Shining hover effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/sidebar:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-red-500/20 to-transparent skew-x-12" />

            <LogOut size={24} className="relative z-10" />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-sm group-hover/sidebar:translate-x-1 transition duration-300 whitespace-pre inline-block p-0! m-0! relative z-10"
            >
              Sign Out
            </motion.span>
          </button>
        </div>
      </div>
    </SidebarBody>
  );
}

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent />
    </Sidebar>
  );
}