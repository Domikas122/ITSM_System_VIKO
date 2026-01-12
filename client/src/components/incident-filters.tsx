import { useState, useEffect, useCallback, useRef } from "react";
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
  Naujas: "Naujas",
  Paskirtas: "Paskirtas",
  Vykdomas: "Vykdomas",
  Išspręstas: "Išspręstas",
  Uždarytas: "Uždarytas",
};

const categoryLabels: Record<IncidentCategory, string> = {
  IT: "IT",
  Kibernetinis: "Kibernetinis",
};

const severityLabels: Record<SeverityLevel, string> = {
  Kritinis: "Kritinis",
  Aukštas: "Aukštas",
  Vidutinis: "Vidutinis",
  Žemas: "Žemas",
};

export function IncidentFilters({ filters, onFiltersChange }: IncidentFiltersProps) {
  const filtersRef = useRef(filters);
  
  // Always keep ref updated
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  const handleSearchSubmit = useCallback(() => {
    onFiltersChange({ ...filtersRef.current, search: searchValue || undefined });
  }, [searchValue, onFiltersChange]);

  const handleStatusChange = useCallback((value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filtersRef.current, status: undefined });
    } else {
      onFiltersChange({ ...filtersRef.current, status: [value as IncidentStatus] });
    }
  }, [onFiltersChange]);

  const handleCategoryChange = useCallback((value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filtersRef.current, category: undefined });
    } else {
      onFiltersChange({ ...filtersRef.current, category: [value as IncidentCategory] });
    }
  }, [onFiltersChange]);

  const handleSeverityChange = useCallback((value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filtersRef.current, severity: undefined });
    } else {
      onFiltersChange({ ...filtersRef.current, severity: [value as SeverityLevel] });
    }
  }, [onFiltersChange]);

  const handleDateFromChange = useCallback((date: Date | undefined) => {
    setDateFrom(date);
    onFiltersChange({ 
      ...filtersRef.current, 
      dateFrom: date ? format(date, "yyyy-MM-dd") : undefined 
    });
  }, [onFiltersChange]);

  const handleDateToChange = useCallback((date: Date | undefined) => {
    setDateTo(date);
    onFiltersChange({ 
      ...filtersRef.current, 
      dateTo: date ? format(date, "yyyy-MM-dd") : undefined 
    });
  }, [onFiltersChange]);

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
              placeholder="Ieškoti incidentų..."
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
            <SelectValue placeholder="Statusas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visi statusai</SelectItem>
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
            <SelectValue placeholder="Kategorija" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visos kategorijos</SelectItem>
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
            <SelectValue placeholder="Lygis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visi lygiai</SelectItem>
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
