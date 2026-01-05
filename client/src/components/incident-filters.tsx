import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  X, 
  CalendarIcon 
} from "lucide-react";
import { format } from "date-fns";
import type { IncidentFilters as Filters, IncidentStatus, IncidentCategory, SeverityLevel } from "@shared/schema";
import { incidentStatuses, incidentCategories, severityLevels } from "@shared/schema";
import { cn } from "@/lib/utils";

interface IncidentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const statusLabels: Record<IncidentStatus, string> = {
  Naujas: "New",
  Paskirtas: "Assigned",
  Vykdomas: "In Progress",
  Išspręstas: "Resolved",
  Uždarytas: "Closed",
};

const categoryLabels: Record<IncidentCategory, string> = {
  IT: "IT",
  Kibernetinis: "Cyber",
};

const severityLabels: Record<SeverityLevel, string> = {
  Kritinis: "Critical",
  Aukštas: "High",
  Vidutinis: "Medium",
  Žemas: "Low",
};

export function IncidentFilters({ filters, onFiltersChange }: IncidentFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  // Sync local state with props when filters change externally
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setDateFrom(filters.dateFrom ? new Date(filters.dateFrom) : undefined);
  }, [filters.dateFrom]);

  useEffect(() => {
    setDateTo(filters.dateTo ? new Date(filters.dateTo) : undefined);
  }, [filters.dateTo]);

  const handleSearchSubmit = useCallback(() => {
    onFiltersChange({ ...filters, search: searchValue || undefined });
  }, [searchValue, onFiltersChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = useCallback((value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, status: undefined });
    } else {
      onFiltersChange({ ...filters, status: [value as IncidentStatus] });
    }
  }, [onFiltersChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = useCallback((value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, category: undefined });
    } else {
      onFiltersChange({ ...filters, category: [value as IncidentCategory] });
    }
  }, [onFiltersChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeverityChange = useCallback((value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, severity: undefined });
    } else {
      onFiltersChange({ ...filters, severity: [value as SeverityLevel] });
    }
  }, [onFiltersChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateFromChange = useCallback((date: Date | undefined) => {
    setDateFrom(date);
    onFiltersChange({ 
      ...filters, 
      dateFrom: date ? format(date, "yyyy-MM-dd") : undefined 
    });
  }, [onFiltersChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateToChange = useCallback((date: Date | undefined) => {
    setDateTo(date);
    onFiltersChange({ 
      ...filters, 
      dateTo: date ? format(date, "yyyy-MM-dd") : undefined 
    });
  }, [onFiltersChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = useCallback(() => {
    setSearchValue("");
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({});
  }, [onFiltersChange]);

  const activeFilterCount = [
    filters.status?.length,
    filters.category?.length,
    filters.severity?.length,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="pl-9 pr-4"
              data-testid="input-search"
            />
          </div>
        </div>

        <Select 
          value={filters.status?.[0] || "all"} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]" data-testid="select-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {incidentStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.category?.[0] || "all"} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[130px]" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {incidentCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.severity?.[0] || "all"} 
          onValueChange={handleSeverityChange}
        >
          <SelectTrigger className="w-[130px]" data-testid="select-severity">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {severityLevels.map((sev) => (
              <SelectItem key={sev} value={sev}>
                {severityLabels[sev]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="button-date-from">
              <CalendarIcon className="h-4 w-4" />
              {dateFrom ? format(dateFrom, "MMM d") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={handleDateFromChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="button-date-to">
              <CalendarIcon className="h-4 w-4" />
              {dateTo ? format(dateTo, "MMM d") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={handleDateToChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="gap-1 text-muted-foreground"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
