'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  BarChart3,
  Users,
  Settings,
  FileText,
  Loader2,
  ArrowRight,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { navigationItems } from '@/constants/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'page';
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  icon?: string;
  relevance: number;
}

interface SearchWidgetProps {
  locale: string;
}

export function SearchWidget({ locale }: SearchWidgetProps) {
  const t = useTranslations();
  const tSearch = useTranslations('header.search');
  const router = useRouter();
  const isMobile = useIsMobile();

  const [searchValue, setSearchValue] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [recentSearches] = useState([
    { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { label: 'Users', icon: Users, href: '/dashboard/users' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]);

  // Search through navigation items
  const searchResults: SearchResult[] = useCallback(() => {
    if (!searchValue || searchValue.length < 2) return [];
    
    const results: SearchResult[] = [];
    const lowerQuery = searchValue.toLowerCase();

    const processItem = (item: any, parentTitle?: string) => {
      const title = item.title.startsWith('navigation.') ? t(item.title) : item.title;
      
      if (title.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'page',
          title: title,
          subtitle: parentTitle,
          href: item.href,
          relevance: 10,
        });
      }
      if (item.children) {
        item.children.forEach((child: any) => processItem(child, title));
      }
    };

    navigationItems.forEach(item => {
      if (item.type === 'link') {
        processItem(item);
      }
    });

    return results;
  }, [searchValue, t])();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isMobile) {
          setMobileDialogOpen(true);
        } else {
          setSearchOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  const handleResultClick = (href: string) => {
    router.push(`/${locale}${href}`);
    setSearchOpen(false);
    setMobileDialogOpen(false);
    setSearchValue('');
  };

  const SearchContent = () => (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={tSearch('placeholder')}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-10 py-3 text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary"
          autoFocus
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : searchValue.length >= 2 ? (
          searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.href)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors text-left"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{tSearch('noResults')}</p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
                {tSearch('recentSearches')}
              </p>
              <div className="space-y-1">
                {recentSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors text-left"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Dialog
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => setMobileDialogOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
          <DialogContent className="sm:max-w-md p-0 gap-0">
            <SearchContent />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop Popover
  return (
    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "relative h-9 justify-start rounded-full text-sm text-muted-foreground",
            "w-9 p-0 lg:w-64 lg:px-3 lg:py-2"
          )}
        >
          <Search className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline-flex">{tSearch('placeholder')}</span>
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0 rounded-2xl" 
        align="start"
        sideOffset={8}
      >
        <SearchContent />
      </PopoverContent>
    </Popover>
  );
}
