"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { 
  navigationItems, 
  type SidebarEntry, 
  type SidebarLinkEntry,
  type SidebarGroupEntry,
  type DynamicListItem,
  type DynamicTagItem,
  type DynamicBoardItem,
  settingsMenuStructure,
} from "@/constants/navigation";
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  ChevronDown, 
  Users, 
  Settings, 
  Plus,
  Lock,
  MoreHorizontal,
  Edit2,
  Sun,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Session } from "next-auth";
import Image from "next/image";
import { CreateListModal } from "@/components/features/tasks/create-list-modal";
import { CreateTagModal } from "@/components/features/tasks/create-tag-modal";
import { CreateBoardModal } from "@/components/features/tasks/create-board-modal";
import { EditListModal } from "@/components/features/tasks/edit-list-modal";
import { EditTagModal } from "@/components/features/tasks/edit-tag-modal";
import { EditBoardModal } from "@/components/features/tasks/edit-board-modal";
import { PremiumDialog } from "@/components/features/premium/premium-dialog";
import { 
  useLists, useTags, useBoards, 
  useCreateList, useCreateTag, useCreateBoard, 
  useUpdateListMutation, useDeleteListMutation,
  useUpdateTagMutation, useDeleteTagMutation,
  useUpdateBoardMutation, useDeleteBoardMutation,
  TaskList, Tag, Board 
} from "@/hooks/use-tasks";

function withLocale(locale: string, href: string) {
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `/${locale}${normalized}`;
}

// Custom Sidebar Context
type CustomSidebarContextType = {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  toggle: () => void;
  toggleCollapse: () => void;
  open: () => void;
  close: () => void;
};

const CustomSidebarContext = React.createContext<CustomSidebarContextType | undefined>(undefined);

export const useCustomSidebar = () => {
  const context = React.useContext(CustomSidebarContext);
  if (!context) {
    throw new Error("useCustomSidebar must be used within CustomSidebarProvider");
  }
  return context;
};

// Custom Sidebar Provider
export function CustomSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobileOrTablet = width < 1024;
      setIsMobile(mobileOrTablet);
      if (mobileOrTablet) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <CustomSidebarContext.Provider
      value={{ isOpen, isCollapsed, isMobile, toggle, toggleCollapse, open, close }}
    >
      {children}
    </CustomSidebarContext.Provider>
  );
}

// Mobile Menu Toggle Button
export function MobileMenuToggle() {
  const { toggle, isOpen, isMobile } = useCustomSidebar();

  if (!isMobile || isOpen) return null;

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden" aria-label="Toggle menu">
      <Menu className="h-5 w-5" />
    </Button>
  );
}

// SideBar Toggle Button
export function SideBarToggle() {
  const { toggle, isOpen } = useCustomSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="hidden md:flex"
      aria-label="Toggle sidebar"
    >
      {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </Button>
  );
}

// Custom Sidebar Inset
export function CustomSidebarInset({ children, locale }: { children: React.ReactNode; locale: string }) {
  const { isOpen, isCollapsed, isMobile } = useCustomSidebar();
  const isRTL = /^ar/.test(locale);

  return (
    <main
      className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-in-out",
        !isMobile && isOpen && !isCollapsed && (isRTL ? "mr-64" : "ml-64"),
        !isMobile && isOpen && isCollapsed && (isRTL ? "mr-16" : "ml-16"),
      )}
    >
      {children}
    </main>
  );
}

// Sidebar Navigation Item Component
function SidebarNavItem({ 
  item, 
  locale, 
  pathname, 
  isCollapsed, 
  showContent,
  isRTL,
  onClose,
  t,
  onEdit, // Added prop
}: {
  item: SidebarLinkEntry;
  locale: string;
  pathname: string | null;
  isCollapsed: boolean;
  showContent: boolean;
  isRTL: boolean;
  onClose: () => void;
  t: (key: string) => string;
  onEdit?: () => void; // Added type
}) {
  const href = withLocale(locale, item.href);
  const isActive = pathname === href || pathname?.startsWith(href + "/");
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine translated title - strip 'navigation.' prefix since tNav already uses 'navigation' namespace
  const displayTitle = item.title.startsWith('navigation.') 
    ? t(item.title.replace('navigation.', '')) 
    : item.title;

  return (
    <li 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group/item"
    >
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full h-9 rounded-lg transition-all duration-200 font-medium group",
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "text-sidebar-foreground/80 hover:bg-accent hover:text-accent-foreground",
          isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3"
        )}
      >
        <Link href={href} onClick={onClose}>
          <Icon icon={item.icon || ""} className={cn(
            "size-5 shrink-0 transition-colors",
            isActive && "text-primary"
          )} />
          <AnimatePresence>
            {showContent && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("truncate text-sm flex-1", isRTL ? "text-right" : "text-left")}
              >
                {displayTitle}
              </motion.span>
            )}
          </AnimatePresence>
          {item.badge && showContent && (
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full text-[0.65rem] px-1.5 min-w-[1.25rem] h-5 flex justify-center items-center",
                isRTL ? "mr-auto" : "ml-auto"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </Button>

      {/* Edit Button */}
      {onEdit && showContent && (
        <div className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded-md",
            isRTL ? "left-2" : "right-2" 
        )}>
            <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                }}
            >
                <Icon icon="solar:pen-new-square-linear" className="size-3.5" />
            </Button>
        </div>
      )}
    </li>
  );
}

// Sidebar Group Header Component
function SidebarGroupHeader({
  title,
  isCollapsible,
  hasAddButton,
  isPremium,
  isExpanded,
  onToggle,
  onAdd,
  showContent,
  isRTL,
  t,
}: {
  title: string;
  isCollapsible?: boolean;
  hasAddButton?: boolean;
  isPremium?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  showContent: boolean;
  isRTL: boolean;
  t: (key: string) => string;
}) {
  // Determine translated title - strip 'navigation.' prefix for proper translation
  const displayTitle = title.startsWith('navigation.') 
    ? t(title.replace('navigation.', '')) 
    : title;
  const [isHovered, setIsHovered] = React.useState(false);

  if (!showContent) return null;

  return (
    <div 
      className={cn(
        "flex items-center justify-between px-3 py-2 group",
        isRTL && "flex-row-reverse"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={isCollapsible ? onToggle : undefined}
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider",
          isCollapsible && "cursor-pointer hover:text-sidebar-foreground transition-colors"
        )}
      >
        <span>{displayTitle}</span>
        {isPremium && (
          <Lock className="size-3 text-sidebar-foreground/40" />
        )}
      </button>
      <div className="flex items-center gap-1">
        {hasAddButton && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <Plus className="size-4" />
          </Button>
        )}
        {isCollapsible && (
          <ChevronDown className={cn(
            "size-3 text-sidebar-foreground/40 transition-transform duration-200",
            !isExpanded && "-rotate-90"
          )} />
        )}
      </div>
    </div>
  );
}

// Main Sidebar Component
export function Sidebar({ locale, session }: { locale: string; session: Session | null }) {
  const pathname = usePathname();
  const t = useTranslations();
  const tSidebar = useTranslations("sidebar");
  const tNav = useTranslations("navigation");
  const { isOpen, isCollapsed, isMobile, close } = useCustomSidebar();
  const [mounted, setMounted] = React.useState(false);

  // Dynamic data from SWR hooks
  const { lists: dynamicLists, mutate: mutateLists } = useLists();
  const { tags: dynamicTags, mutate: mutateTags } = useTags();
  const { boards: dynamicBoards, mutate: mutateBoards } = useBoards();
  const { createList } = useCreateList();
  const { createTag } = useCreateTag();
  const { createBoard } = useCreateBoard();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [companyName, setCompanyName] = React.useState<string>("");
  const [companyLogo, setCompanyLogo] = React.useState<string>("");

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "User";
  const organizationName = (
    session?.user as { organization?: { name?: string } } | undefined
  )?.organization?.name;

  const isRTL = /^ar/.test(locale);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    lists: true,
    tags: true,
    boards: true,
  });

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const showContent = !isCollapsed;

  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false);

  // Modal states
  const [isCreateListModalOpen, setIsCreateListModalOpen] = React.useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = React.useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = React.useState(false);

  // Edit States
  const [editingList, setEditingList] = React.useState<TaskList | undefined>(undefined);
  const [editingTag, setEditingTag] = React.useState<Tag | undefined>(undefined);
  const [editingBoard, setEditingBoard] = React.useState<Board | undefined>(undefined);

  // Premium Dialog State
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = React.useState(false);

  // Edit/Delete Hooks
  const { updateList } = useUpdateListMutation();
  const { deleteList } = useDeleteListMutation();
  const { updateTag } = useUpdateTagMutation();
  const { deleteTag } = useDeleteTagMutation();
  const { updateBoard } = useUpdateBoardMutation();
  const { deleteBoard } = useDeleteBoardMutation();

  // Handlers for creating items using SWR mutations
  const handleCreateList = async (data: { name: string; icon: string; color: string }) => {
    try {
      await createList(data);
      mutateLists(); // Refresh the lists cache
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  };

  const handleCreateTag = async (data: { name: string; color: string }) => {
    try {
      await createTag(data);
      mutateTags(); // Refresh the tags cache
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  const handleCreateBoard = async (data: { name: string; description?: string; color: string; defaultView: string }) => {
    try {
      await createBoard(data);
      mutateBoards(); // Refresh the boards cache
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  };

  const handleUpdateList = async (id: string, data: any) => {
      await updateList(id, data);
      mutateLists(); 
  };
  const handleDeleteList = async (id: string) => {
      await deleteList(id);
      mutateLists();
  };

  const handleUpdateTag = async (id: string, data: any) => {
      await updateTag(id, data);
      mutateTags();
  };
  const handleDeleteTag = async (id: string) => {
      await deleteTag(id);
      mutateTags();
  };

  const handleUpdateBoard = async (id: string, data: any) => {
      await updateBoard(id, data);
      mutateBoards();
  };
  const handleDeleteBoard = async (id: string) => {
      await deleteBoard(id);
      mutateBoards();
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return tSidebar("greeting.morning");
    if (hour < 17) return tSidebar("greeting.afternoon");
    if (hour < 21) return tSidebar("greeting.evening");
    return tSidebar("greeting.night");
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Separate navigation items by type
  const coreViewItems = navigationItems.filter(
    (item): item is SidebarLinkEntry => 
      item.type === "link" && 
      (item.href.endsWith("/myday") || 
       item.href.includes("/tasks/next-seven-days") || 
       item.href.includes("/tasks/all") ||
       item.href.endsWith("/calendar"))
  ).slice(0, 4); // First 4 items

  const settingsItem = navigationItems.find(
    (item): item is SidebarLinkEntry => 
      item.type === "link" && item.href.includes("/settings")
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{
              x: isRTL ? "100%" : "-100%",
              width: isMobile ? "18rem" : isCollapsed ? "4rem" : "16rem",
            }}
            animate={{
              x: 0,
              width: isMobile ? "18rem" : isCollapsed ? "4rem" : "16rem",
            }}
            exit={{
              x: isRTL ? "100%" : "-100%",
              width: isMobile ? "18rem" : isCollapsed ? "4rem" : "16rem",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed top-0 h-screen bg-sidebar backdrop-blur-md z-50 flex flex-col shadow-lg",
              isRTL ? "right-0 border-l" : "left-0 border-r",
              "border-sidebar-border",
              isMobile ? "w-72" : sidebarWidth
            )}
          >
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                className={cn(
                  "absolute h-72 w-72 rounded-full bg-primary/10 blur-3xl",
                  isRTL ? "-right-40" : "-left-40"
                )}
                animate={{
                  x: [0, 30, -20, 0],
                  y: [0, -40, 20, 0],
                  scale: [1, 1.1, 0.9, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ top: "25%" }}
              />
            </div>

            {/* Header - User Profile (Any.do Style) */}
            <div className="relative p-4">
              <div className={cn("flex items-center", isRTL ? "flex-row-reverse" : "", "justify-between")}>
                <Popover open={settingsMenuOpen} onOpenChange={setSettingsMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-auto p-2 hover:bg-accent rounded-lg transition-colors",
                        "gap-3",
                        isCollapsed && "justify-center"
                      )}
                    >
                      {/* Profile Avatar */}
                      <div className="flex aspect-square size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-sm overflow-hidden border-2 border-primary/20">
                        {session?.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt="Profile" 
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <AnimatePresence>
                        {showContent && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              "flex flex-col gap-0.5 leading-none overflow-hidden text-left",
                              isRTL && "text-right"
                            )}
                          >
                            <span className="font-semibold text-sm">{userName}</span>
                            <span className="text-xs text-sidebar-foreground/60 flex items-center gap-1">
                              {tSidebar("freePlan")}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-64 p-0 bg-popover/95 backdrop-blur-md shadow-xl" 
                    align="start" 
                    side="right"
                  >
                    {/* Settings Menu (Any.do Style) */}
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{userName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {tSidebar("freePlan")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Go Premium CTA */}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => {
                          setSettingsMenuOpen(false);
                          setIsPremiumDialogOpen(true);
                        }}
                      >
                        <Crown className="size-4" />
                        <span>{tSidebar("goPremium")}</span>
                        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          {tSidebar("tryFree")}
                        </span>
                      </Button>

                    {/* Account Section */}
                    <div className="p-2">
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                        {tSidebar("settings.account")}
                      </div>
                      {settingsMenuStructure.account.map((item) => (
                        <Button
                          key={item.key}
                          asChild
                          variant="ghost"
                          className="w-full justify-start text-sm"
                        >
                          <Link 
                            href={withLocale(locale, item.href)}
                            onClick={() => {
                              setSettingsMenuOpen(false);
                              if (isMobile) close();
                            }}
                          >
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>

                    {/* Preferences Section */}
                    <div className="p-2 border-t">
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                        {tSidebar("settings.preferences")}
                      </div>
                      {settingsMenuStructure.preferences.slice(0, 4).map((item) => (
                        <Button
                          key={item.key}
                          asChild
                          variant="ghost"
                          className="w-full justify-start text-sm"
                        >
                          <Link 
                            href={withLocale(locale, item.href)}
                            onClick={() => {
                              setSettingsMenuOpen(false);
                              if (isMobile) close();
                            }}
                          >
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={close} className="shrink-0">
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

          {showContent && (
  <div className="px-3 mb-2">
    <Button
      variant="ghost"
      onClick={() => setIsPremiumDialogOpen(true)}
      className="relative w-full h-8 justify-start gap-2 overflow-hidden group
                 bg-gradient-to-r from-primary to-primary/90
                 text-primary-foreground border-0
                 rounded-2xl
                 shadow-md shadow-primary/15
                 transition-all duration-200
                 hover:shadow-lg hover:shadow-primary/25
                 hover:scale-[1.01] active:scale-[0.98]"
    >
      {/* Subtle shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                      translate-x-[-200%] group-hover:translate-x-[200%]
                      transition-transform duration-700 rounded-2xl" />

      {/* Content */}
      <div className="relative flex items-center gap-2 w-full">
        <div className="flex items-center justify-center size-6 rounded-full ">
          <Crown className="size-4" />
        </div>

        <span className="font-medium text-sm">
          {tSidebar("goPremium")}
        </span>

        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full
                         bg-white/20 border border-white/25">
          {tSidebar("tryFree")}
        </span>
      </div>
    </Button>
  </div>
)}


            {/* Navigation Content */}
            <nav className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {/* Core Views (My Day, Next 7 Days, All Tasks, Calendar) */}
              <ul className="space-y-1 mb-4">
                {coreViewItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    locale={locale}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    showContent={showContent}
                    isRTL={isRTL}
                    onClose={() => isMobile && close()}
                    t={tNav}
                  />
                ))}
              </ul>

              {/* My Lists Section */}
              <div className="mb-4">
                <SidebarGroupHeader
                  title="navigation.groups.myLists"
                  isCollapsible={true}
                  hasAddButton={true}
                  isPremium={true}
                  isExpanded={expandedSections.lists}
                  onToggle={() => handleSectionToggle("lists")}
                  onAdd={() => setIsCreateListModalOpen(true)}
                  showContent={showContent}
                  isRTL={isRTL}
                  t={tNav}
                />
                <AnimatePresence>
                  {expandedSections.lists && showContent && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >

                      {/* Dynamic lists from database */}
                      {dynamicLists.map((list: TaskList) => (
                        <SidebarNavItem
                          key={list.id}
                          item={{ 
                            type: "link", 
                            title: list.name, 
                            // Path includes dashboard
                            href: `/dashboard/tasks/lists/${list.id}`, 
                            icon: list.icon || "solar:folder-outline" 
                          }}
                          locale={locale}
                          pathname={pathname}
                          isCollapsed={false}
                          showContent={true}
                          isRTL={isRTL}
                          onClose={() => isMobile && close()}
                          t={tNav}
                          onEdit={() => setEditingList(list)}
                        />
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags Section */}
              <div className="mb-4">
                <SidebarGroupHeader
                  title="navigation.groups.tags"
                  isCollapsible={true}
                  hasAddButton={true}
                  isExpanded={expandedSections.tags}
                  onToggle={() => handleSectionToggle("tags")}
                  onAdd={() => setIsCreateTagModalOpen(true)}
                  showContent={showContent}
                  isRTL={isRTL}
                  t={tNav}
                />
                <AnimatePresence>
                  {expandedSections.tags && showContent && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >

                      {/* Dynamic tags from database */}
                      {dynamicTags.map((tag: Tag) => (
                        <li key={tag.id} className="relative group/item">
                          <Button
                            asChild
                            variant="ghost"
                            className="w-full h-9 rounded-lg justify-start gap-3 px-3"
                            style={{ color: tag.color }}
                          >
                            <Link href={withLocale(locale, `/dashboard/tags/tag/${tag.id}`)} onClick={() => isMobile && close()}>
                              <span className="text-sm">#{tag.name}</span>
                            </Link>
                          </Button>
                          {/* Edit Tag Button */}
                           <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded-md",
                                isRTL ? "left-2" : "right-2"
                            )}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingTag(tag);
                                    }}
                                >
                                    <Icon icon="solar:pen-new-square-linear" className="size-3.5" />
                                </Button>
                            </div>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Boards Section (Kanban) */}
              <div className="mb-4">
                <SidebarGroupHeader
                  title="navigation.groups.boards"
                  isCollapsible={true}
                  hasAddButton={true}
                  isExpanded={expandedSections.boards}
                  onToggle={() => handleSectionToggle("boards")}
                  onAdd={() => setIsCreateBoardModalOpen(true)}
                  showContent={showContent}
                  isRTL={isRTL}
                  t={tNav}
                />
                <AnimatePresence>
                  {expandedSections.boards && showContent && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {dynamicBoards.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-muted-foreground">
                          {tSidebar("noBoards")}
                        </li>
                      ) : (
                        dynamicBoards.map((board: Board) => (
                          <SidebarNavItem
                            key={board.id}
                            item={{ 
                              type: "link", 
                              title: board.name, 
                              href: `/dashboard/boards/${board.id}`, 
                              icon: board.icon || "solar:clipboard-list-outline" 
                            }}
                            locale={locale}
                            pathname={pathname}
                            isCollapsed={false}
                            showContent={true}
                            isRTL={isRTL}
                            onClose={() => isMobile && close()}
                            t={tNav}
                            onEdit={() => setEditingBoard(board)}
                          />
                        ))
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Footer - Premium & Add Shared Space */}
            {showContent && (
              <div className="relative p-3 border-t border-sidebar-border space-y-2">
              
                {/* Add Shared Space Button */}
                <Button 
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground"
                >
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="size-4 text-primary" />
                  </div>
                  <span className="text-sm">{tSidebar("addSharedSpace")}</span>
                </Button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Create Modals */}
      <CreateListModal
        open={isCreateListModalOpen}
        onOpenChange={setIsCreateListModalOpen}
        onSubmit={handleCreateList}
      />
      <CreateTagModal
        open={isCreateTagModalOpen}
        onOpenChange={setIsCreateTagModalOpen}
        onSubmit={handleCreateTag}
      />
      <CreateBoardModal
        open={isCreateBoardModalOpen}
        onOpenChange={setIsCreateBoardModalOpen}
        onSubmit={handleCreateBoard}
      />
      
      {/* Edit Modals */}
      <EditListModal 
        open={!!editingList} 
        onOpenChange={(open) => !open && setEditingList(undefined)}
        list={editingList}
        onSubmit={handleUpdateList}
        onDelete={handleDeleteList}
      />
      <EditTagModal
        open={!!editingTag}
        onOpenChange={(open) => !open && setEditingTag(undefined)}
        tag={editingTag}
        onSubmit={handleUpdateTag}
        onDelete={handleDeleteTag}
      />
      <EditBoardModal
        open={!!editingBoard}
        onOpenChange={(open) => !open && setEditingBoard(undefined)}
        board={editingBoard}
        onSubmit={handleUpdateBoard}
        onDelete={handleDeleteBoard}
      />

      {/* Premium Dialog */}
      <PremiumDialog
        open={isPremiumDialogOpen}
        onOpenChange={setIsPremiumDialogOpen}
      />
    </>
  );
}