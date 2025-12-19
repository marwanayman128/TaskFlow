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
  CheckSquare,
  List,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { navigationItems } from '@/constants/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTasks, useLists, useTags, useBoards, Task, TaskList, Tag as TaskTag, Board } from '@/hooks/use-tasks';

interface SearchResult {
  id: string;
  type: 'page' | 'task' | 'list' | 'tag' | 'board';
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  icon?: string;
  color?: string;
  relevance: number;
  completed?: boolean;
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch data for smart search
  const { tasks } = useTasks();
  const { lists } = useLists();
  const { tags } = useTags();
  const { boards } = useBoards();

  const [recentSearches] = useState([
    { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { label: 'My Day', icon: CheckSquare, href: '/dashboard/myday' },
    { label: 'Calendar', icon: FileText, href: '/dashboard/calendar' },
  ]);

  // Smart search algorithm
  const searchResults: SearchResult[] = useMemo(() => {
    if (!searchValue || searchValue.length < 2) return [];
    
    const results: SearchResult[] = [];
    const lowerQuery = searchValue.toLowerCase();
    const queryTerms = lowerQuery.split(' ').filter(t => t.length > 0);

    // Calculate relevance score
    const getRelevance = (title: string, description?: string): number => {
      const lowerTitle = title.toLowerCase();
      const lowerDesc = (description || '').toLowerCase();
      
      let score = 0;
      
      // Exact match
      if (lowerTitle === lowerQuery) score += 100;
      // Starts with query
      else if (lowerTitle.startsWith(lowerQuery)) score += 50;
      // Contains query
      else if (lowerTitle.includes(lowerQuery)) score += 30;
      
      // Match individual terms
      queryTerms.forEach(term => {
        if (lowerTitle.includes(term)) score += 10;
        if (lowerDesc.includes(term)) score += 5;
      });
      
      return score;
    };

    // Search Tasks
    if (tasks && tasks.length > 0) {
      tasks.forEach((task: Task) => {
        const relevance = getRelevance(task.title, task.description);
        if (relevance > 0) {
          results.push({
            id: task.id,
            type: 'task',
            title: task.title,
            subtitle: task.listName || 'Task',
            description: task.description,
            href: `/dashboard/tasks/lists/${task.listId}?task=${task.id}`,
            color: task.listColor,
            relevance,
            completed: task.completed,
          });
        }
      });
    }

    // Search Lists
    if (lists && lists.length > 0) {
      lists.forEach((list: TaskList) => {
        const relevance = getRelevance(list.name, list.description);
        if (relevance > 0) {
          results.push({
            id: list.id,
            type: 'list',
            title: list.name,
            subtitle: `${list.taskCount || 0} tasks`,
            href: `/dashboard/tasks/lists/${list.id}`,
            icon: list.icon,
            color: list.color,
            relevance: relevance + 5, // Slight boost for lists
          });
        }
      });
    }

    // Search Tags
    if (tags && tags.length > 0) {
      tags.forEach((tag: TaskTag) => {
        const relevance = getRelevance(tag.name);
        if (relevance > 0) {
          results.push({
            id: tag.id,
            type: 'tag',
            title: tag.name,
            subtitle: `${tag.taskCount || 0} tasks`,
            href: `/dashboard/tasks/tags/${tag.id}`,
            color: tag.color,
            relevance: relevance + 3,
          });
        }
      });
    }

    // Search Boards
    if (boards && boards.length > 0) {
      boards.forEach((board: Board) => {
        const relevance = getRelevance(board.name, board.description);
        if (relevance > 0) {
          results.push({
            id: board.id,
            type: 'board',
            title: board.name,
            subtitle: `${board.taskCount || 0} tasks`,
            description: board.description,
            href: `/dashboard/boards/${board.id}`,
            icon: board.icon,
            color: board.color,
            relevance: relevance + 5,
          });
        }
      });
    }

    // Search Navigation Pages
    const processItem = (item: any, parentTitle?: string) => {
      const title = item.title.startsWith('navigation.') ? t(item.title) : item.title;
      const relevance = getRelevance(title);
      
      if (relevance > 0) {
        results.push({
          id: item.href,
          type: 'page',
          title: title,
          subtitle: parentTitle || 'Page',
          href: item.href,
          relevance,
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

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 15);
  }, [searchValue, tasks, lists, tags, boards, t]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      task: [],
      list: [],
      board: [],
      tag: [],
      page: [],
    };
    
    searchResults.forEach(result => {
      groups[result.type].push(result);
    });

    return groups;
  }, [searchResults]);

  // Handle keyboard navigation
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

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleResultClick = (href: string) => {
    router.push(`/${locale}${href}`);
    setSearchOpen(false);
    setMobileDialogOpen(false);
    setSearchValue('');
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      handleResultClick(searchResults[selectedIndex].href);
    }
  };

  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        return <CheckSquare className="h-4 w-4" style={{ color: result.color }} />;
      case 'list':
        return result.icon ? (
          <Icon icon={result.icon} className="h-4 w-4" style={{ color: result.color }} />
        ) : (
          <List className="h-4 w-4" style={{ color: result.color }} />
        );
      case 'board':
        return result.icon ? (
          <Icon icon={result.icon} className="h-4 w-4" style={{ color: result.color }} />
        ) : (
          <LayoutGrid className="h-4 w-4" style={{ color: result.color }} />
        );
      case 'tag':
        return <Tag className="h-4 w-4" style={{ color: result.color }} />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return 'Tasks';
      case 'list': return 'Lists';
      case 'board': return 'Boards';
      case 'tag': return 'Tags';
      case 'page': return 'Pages';
      default: return type;
    }
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
          onKeyDown={handleKeyNavigation}
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

      <div className="max-h-[400px] overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : searchValue.length >= 2 ? (
          searchResults.length > 0 ? (
            <div className="space-y-3">
              {/* Render grouped results */}
              {Object.entries(groupedResults).map(([type, results]) => {
                if (results.length === 0) return null;
                
                return (
                  <div key={type}>
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">
                      {getTypeLabel(type)}
                    </div>
                    <div className="space-y-0.5">
                      {results.map((result, index) => {
                        const globalIndex = searchResults.indexOf(result);
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.href)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left",
                              globalIndex === selectedIndex 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-accent"
                            )}
                          >
                            {getResultIcon(result)}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                result.completed && "line-through text-muted-foreground"
                              )}>
                                {result.title}
                              </p>
                              {result.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{tSearch('noResults')}</p>
              <p className="text-xs mt-1">Try searching for tasks, lists, boards, or tags</p>
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
            
            {/* Quick access tips */}
            <div className="px-3 py-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Tip:</span> Search across tasks, lists, boards, and tags for quick access
              </p>
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
        className="w-[450px] p-0 rounded-2xl" 
        align="start"
        sideOffset={8}
      >
        <SearchContent />
      </PopoverContent>
    </Popover>
  );
}
