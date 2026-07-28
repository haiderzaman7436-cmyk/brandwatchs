import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useAudit } from "@/hooks/useAudit";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Badge 
} from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Activity,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Copy,
  Star,
  StarOff,
  MoreHorizontal,
  Loader2,
  Sparkles,
  TrendingUp,
  Layers,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Package,
  Settings,
  Globe,
  FileText
} from "lucide-react";

// Types
interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  category?: string;
}

// Helper functions
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch {
    return 'Invalid date';
  }
};

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('create') || actionLower.includes('add')) return <Plus className="h-3 w-3" />;
  if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit className="h-3 w-3" />;
  if (actionLower.includes('delete') || actionLower.includes('remove')) return <Trash2 className="h-3 w-3" />;
  if (actionLower.includes('login')) return <LogIn className="h-3 w-3" />;
  if (actionLower.includes('logout')) return <LogOut className="h-3 w-3" />;
  if (actionLower.includes('setting') || actionLower.includes('config')) return <Settings className="h-3 w-3" />;
  if (actionLower.includes('payment') || actionLower.includes('order')) return <CreditCard className="h-3 w-3" />;
  if (actionLower.includes('user') || actionLower.includes('account')) return <User className="h-3 w-3" />;
  if (actionLower.includes('product') || actionLower.includes('inventory')) return <Package className="h-3 w-3" />;
  return <Activity className="h-3 w-3" />;
};

const getSeverityColor = (severity?: string): { bg: string; text: string; icon: JSX.Element } => {
  switch (severity) {
    case 'error':
      return { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-400',
        icon: <XCircle className="h-3 w-3" />
      };
    case 'warning':
      return { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-400',
        icon: <AlertCircle className="h-3 w-3" />
      };
    case 'success':
      return { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-400',
        icon: <CheckCircle className="h-3 w-3" />
      };
    default:
      return { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-400',
        icon: <Info className="h-3 w-3" />
      };
  }
};

// Sample data generator for demonstration
const generateSampleLogs = (): AuditLog[] => {
  const actions = [
    'User Login', 'User Logout', 'Product Added', 'Product Updated', 
    'Product Deleted', 'Order Created', 'Order Updated', 'Order Cancelled',
    'Payment Processed', 'Payment Failed', 'Settings Changed', 'Password Changed',
    'Profile Updated', 'Export Completed'
  ];
  
  const categories = ['user', 'order', 'product', 'payment', 'security', 'settings'];
  const severities: ('info' | 'warning' | 'error' | 'success')[] = ['info', 'warning', 'error', 'success'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `log-${i + 1}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    details: `Sample audit log entry #${i + 1} with detailed information about the action performed in the system.`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    userId: `user-${Math.floor(Math.random() * 10) + 1}`,
    userName: `User ${Math.floor(Math.random() * 10) + 1}`,
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    category: categories[Math.floor(Math.random() * categories.length)]
  }));
};

const Audit: React.FC = () => {
  const { logs: originalLogs } = useAudit();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookmarkedLogs, setBookmarkedLogs] = useState<string[]>([]);
  
  const itemsPerPage = 10;

  // Load logs
  useEffect(() => {
    if (originalLogs && originalLogs.length) {
      setLogs(originalLogs as AuditLog[]);
    } else {
      setLogs(generateSampleLogs());
    }
  }, [originalLogs]);

  // Get unique actions, categories, severities
  const actions = useMemo(() => {
    const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort();
    return uniqueActions;
  }, [logs]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(logs.map(l => l.category).filter(Boolean))).sort() as string[];
    return uniqueCategories;
  }, [logs]);

  const severities = useMemo(() => {
    const uniqueSeverities = Array.from(new Set(logs.map(l => l.severity).filter(Boolean))).sort() as string[];
    return uniqueSeverities;
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      const matchesSearch = search === "" || 
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        (log.userName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (log.ipAddress || '').includes(search);
      
      // Action filter
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
      
      // Severity filter
      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
      
      // Date range filter
      let matchesDate = true;
      if (dateRange !== "all") {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        
        if (dateRange === "today") {
          matchesDate = logDate.toDateString() === now.toDateString();
        } else if (dateRange === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = logDate >= weekAgo;
        } else if (dateRange === "month") {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = logDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesAction && matchesCategory && matchesSeverity && matchesDate;
    }).sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [logs, search, actionFilter, categoryFilter, severityFilter, dateRange, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const todayCount = filteredLogs.filter(l => 
      new Date(l.timestamp).toDateString() === new Date().toDateString()
    ).length;
    
    const severityCounts = {
      info: filteredLogs.filter(l => l.severity === 'info').length,
      warning: filteredLogs.filter(l => l.severity === 'warning').length,
      error: filteredLogs.filter(l => l.severity === 'error').length,
      success: filteredLogs.filter(l => l.severity === 'success').length,
    };
    
    const uniqueUsers = new Set(filteredLogs.map(l => l.userId).filter(Boolean)).size;
    
    return { total, todayCount, severityCounts, uniqueUsers };
  }, [filteredLogs]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, categoryFilter, severityFilter, dateRange]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const headers = ['Action', 'Details', 'Timestamp', 'User', 'IP Address', 'Severity', 'Category'];
      const csvData = filteredLogs.map(l => [
        l.action,
        l.details,
        new Date(l.timestamp).toLocaleString(),
        l.userName || 'N/A',
        l.ipAddress || 'N/A',
        l.severity || 'N/A',
        l.category || 'N/A'
      ]);

      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filteredLogs]);

  const handleViewDetails = useCallback((log: AuditLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  }, []);

  const handleCopyDetails = useCallback((details: string) => {
    navigator.clipboard.writeText(details);
  }, []);

  const toggleBookmark = useCallback((logId: string) => {
    setBookmarkedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setActionFilter("all");
    setCategoryFilter("all");
    setSeverityFilter("all");
    setDateRange("all");
  }, []);

  const hasActiveFilters = search !== "" || actionFilter !== "all" || categoryFilter !== "all" || severityFilter !== "all" || dateRange !== "all";

  // Fixed SVG pattern - properly escaped and formatted
  const gridPattern = "M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z";

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-600 p-6">
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='${gridPattern}'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-cards/20 backdrop-blur-sm rounded-xl">
                <Shield className="h-8 w-8 text-brand-text" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-text">
                  Audit Log
                </h1>
                <p className="text-sm text-brand-text/80 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Track and monitor all system activities
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-2 bg-brand-cards/20 hover:bg-brand-cards/30 text-brand-text border-white/30 backdrop-blur-sm"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh audit logs</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExport}
                    disabled={!filteredLogs.length}
                    className="gap-2 bg-brand-cards/20 hover:bg-brand-cards/30 text-brand-text border-white/30 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export logs to CSV</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-zinc-500 to-cyan-500 border-0 text-brand-text shadow-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-brand-text/80" />
                <Sparkles className="h-4 w-4 text-brand-text/60" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-brand-text/80 mt-1">Total Events</p>
              <p className="text-[10px] text-brand-text/60">Audit entries</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-brand-text shadow-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-brand-text/80" />
                <Sparkles className="h-4 w-4 text-brand-text/60" />
              </div>
              <p className="text-2xl font-bold">{stats.todayCount}</p>
              <p className="text-xs text-brand-text/80 mt-1">Today</p>
              <p className="text-[10px] text-brand-text/60">New events</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-500 border-0 text-brand-text shadow-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 text-brand-text/80" />
                <Sparkles className="h-4 w-4 text-brand-text/60" />
              </div>
              <p className="text-2xl font-bold">{stats.severityCounts.success}</p>
              <p className="text-xs text-brand-text/80 mt-1">Success</p>
              <p className="text-[10px] text-brand-text/60">Operations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-brand-text shadow-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-brand-text/80" />
                <Sparkles className="h-4 w-4 text-brand-text/60" />
              </div>
              <p className="text-2xl font-bold">{stats.severityCounts.warning}</p>
              <p className="text-xs text-brand-text/80 mt-1">Warnings</p>
              <p className="text-[10px] text-brand-text/60">Issues</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-amber-500 border-0 text-brand-text shadow-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-5 w-5 text-brand-text/80" />
                <Sparkles className="h-4 w-4 text-brand-text/60" />
              </div>
              <p className="text-2xl font-bold">{stats.severityCounts.error}</p>
              <p className="text-xs text-brand-text/80 mt-1">Errors</p>
              <p className="text-[10px] text-brand-text/60">Failures</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-brand-cards/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search and basic filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                  <Input
                    placeholder="Search logs by action, details, user, or IP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-8 bg-brand-cards/50 dark:bg-gray-800/50 border-2 focus:border-zinc-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                    >
                      <X className="h-3 w-3 text-brand-secondary" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-brand-cards/50 dark:bg-gray-800/50 border-2">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actions.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={dateRange} onValueChange={(value: "all" | "today" | "week" | "month") => setDateRange(value)}>
                    <SelectTrigger className="w-full md:w-[150px] bg-brand-cards/50 dark:bg-gray-800/50 border-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="w-10 bg-brand-cards/50 dark:bg-gray-800/50 border-2"
                      >
                        <TrendingUp className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? '' : 'rotate-180'}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Advanced filters */}
              {(categories.length > 0 || severities.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.length > 0 && (
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px] bg-brand-cards/50 dark:bg-gray-800/50 border-2">
                        <Layers className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {severities.length > 0 && (
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-[180px] bg-brand-cards/50 dark:bg-gray-800/50 border-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        {severities.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-brand-secondary">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {search && (
                      <Badge variant="secondary" className="gap-1">
                        Search: "{search}"
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                      </Badge>
                    )}
                    {actionFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Action: {actionFilter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setActionFilter("all")} />
                      </Badge>
                    )}
                    {categoryFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Category: {categoryFilter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
                      </Badge>
                    )}
                    {severityFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Severity: {severityFilter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSeverityFilter("all")} />
                      </Badge>
                    )}
                    {dateRange !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Date: {dateRange}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRange("all")} />
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                      Clear all
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Stats */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-secondary">
            Showing {filteredLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          <Badge variant="outline" className="px-3 py-1">
            {stats.uniqueUsers} unique users
          </Badge>
        </div>

        {/* Table View */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-brand-text dark:text-gray-100 mb-2">
              No audit entries found
            </h3>
            <p className="text-brand-secondary mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Audit logs will appear here as activities are tracked'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <Card className="border-0 shadow-xl overflow-hidden bg-brand-cards/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-zinc-500/10 to-amber-500/10">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => {
                      const severity = getSeverityColor(log.severity);
                      const isBookmarked = bookmarkedLogs.includes(log.id);
                      
                      return (
                        <TableRow key={log.id} className="hover:bg-brand-background dark:hover:bg-gray-800/50">
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => toggleBookmark(log.id)}
                                >
                                  {isBookmarked ? (
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <StarOff className="h-3 w-3 text-brand-secondary" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isBookmarked ? 'Remove bookmark' : 'Bookmark'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${severity.bg}`}>
                                {getActionIcon(log.action)}
                              </div>
                              <span className="font-medium">{log.action}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="text-sm line-clamp-1">
                                {log.details}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-background dark:bg-brand-primary text-white/30 flex items-center justify-center">
                                <User className="h-3 w-3 text-brand-accent dark:text-amber-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{log.userName || 'System'}</p>
                                <p className="text-xs text-brand-secondary">{log.ipAddress || 'N/A'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-brand-secondary" />
                              <span className="text-sm">{formatDate(log.timestamp)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${severity.bg} ${severity.text} border-0 flex items-center gap-1 w-fit`}>
                              {severity.icon}
                              {log.severity || 'info'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewDetails(log)}
                                  >
                                    <Eye className="h-4 w-4 text-brand-text" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleCopyDetails(log.details)}
                                  >
                                    <Copy className="h-4 w-4 text-brand-secondary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-brand-secondary">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 3 + i;
                      }
                      if (pageNum <= totalPages && pageNum > 0) {
                        return (
                          <Button
                            key={i}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="min-w-[40px]"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg shadow-sm">
                <span className="text-brand-secondary">Total Logs</span>
                <span className="font-medium ml-1 text-brand-text dark:text-gray-100">{filteredLogs.length}</span>
              </div>
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg shadow-sm">
                <span className="text-brand-secondary">Unique Users</span>
                <span className="font-medium ml-1 text-brand-text dark:text-gray-100">{stats.uniqueUsers}</span>
              </div>
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg shadow-sm">
                <span className="text-brand-secondary">Info Events</span>
                <span className="font-medium ml-1 text-brand-text dark:text-gray-100">{stats.severityCounts.info}</span>
              </div>
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg shadow-sm">
                <span className="text-brand-secondary">Error Rate</span>
                <span className="font-medium ml-1 text-brand-text dark:text-gray-100">
                  {filteredLogs.length > 0 ? Math.round((stats.severityCounts.error / filteredLogs.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </>
        )}

        {/* Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-brand-accent" />
                Audit Log Details
              </DialogTitle>
              <DialogDescription>
                Complete information for this audit entry
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-brand-secondary">Action</p>
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getSeverityColor(selectedLog.severity).bg}`}>
                          {getActionIcon(selectedLog.action)}
                        </div>
                        <p className="font-medium">{selectedLog.action}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-brand-secondary">Severity</p>
                      <Badge className={`${getSeverityColor(selectedLog.severity).bg} ${getSeverityColor(selectedLog.severity).text} border-0 flex items-center gap-1 w-fit`}>
                        {getSeverityColor(selectedLog.severity).icon}
                        {selectedLog.severity || 'info'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-brand-secondary">Details</p>
                    <p className="text-brand-text dark:text-gray-100">{selectedLog.details}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-brand-secondary">User</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-background dark:bg-brand-primary text-white/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-brand-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedLog.userName || 'System'}</p>
                          <p className="text-xs text-brand-secondary">ID: {selectedLog.userId || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-brand-secondary">IP Address</p>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-brand-secondary" />
                        <p className="font-mono">{selectedLog.ipAddress || 'N/A'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-brand-secondary">Timestamp</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-secondary" />
                      <p>{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-brand-secondary">
                      {formatDate(selectedLog.timestamp)}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => handleCopyDetails(selectedLog.details)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-zinc-900 to-amber-600 text-brand-text"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Audit;