'use client';

import * as React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { MapPin, Navigation, Search, Loader2, X, Home, Briefcase, ShoppingCart, Coffee } from 'lucide-react';
import { toast } from 'sonner';

export interface LocationReminder {
  id?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  triggerOn: 'ARRIVE' | 'LEAVE';
}

interface LocationReminderEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: LocationReminder | null;
  onChange: (location: LocationReminder | null) => void;
}

const PRESET_LOCATIONS = [
  { icon: Home, label: 'Home', key: 'home' },
  { icon: Briefcase, label: 'Work', key: 'work' },
  { icon: ShoppingCart, label: 'Store', key: 'grocery' },
  { icon: Coffee, label: 'Café', key: 'cafe' },
];

const RADIUS_OPTIONS = [
  { value: 100, label: '100m' },
  { value: 250, label: '250m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
];

export function LocationReminderEditor({ open, onOpenChange, value, onChange }: LocationReminderEditorProps) {
  const [location, setLocation] = React.useState<LocationReminder>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: 250,
    triggerOn: 'ARRIVE',
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  // Initialize from value
  React.useEffect(() => {
    if (value && open) {
      setLocation(value);
    } else if (open) {
      setLocation({
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        radius: 250,
        triggerOn: 'ARRIVE',
      });
    }
  }, [value, open]);

  const handleSave = () => {
    if (!location.name || (location.latitude === 0 && location.longitude === 0)) {
      toast.error('Please select a location');
      return;
    }
    onChange(location);
    onOpenChange(false);
  };

  const handleClear = () => {
    onChange(null);
    onOpenChange(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) for geocoding - free and no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: 'json',
          limit: '5',
          addressdetails: '1',
        }),
        { headers: { 'Accept-Language': 'en' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      toast.error('Failed to search location');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    setLocation(prev => ({
      ...prev,
      name: result.display_name.split(',')[0],
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
              lat: latitude.toString(),
              lon: longitude.toString(),
              format: 'json',
            }),
            { headers: { 'Accept-Language': 'en' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            setLocation(prev => ({
              ...prev,
              name: 'Current Location',
              address: data.display_name,
              latitude,
              longitude,
            }));
          } else {
            setLocation(prev => ({
              ...prev,
              name: 'Current Location',
              latitude,
              longitude,
            }));
          }
        } catch (error) {
          setLocation(prev => ({
            ...prev,
            name: 'Current Location',
            latitude,
            longitude,
          }));
        }
        
        setIsGettingLocation(false);
        toast.success('Location detected!');
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error('Failed to get your location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            Location Reminder
          </DialogTitle>
          <DialogDescription>
            Get reminded when you arrive at or leave a location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="flex-1"
            >
              {isGettingLocation ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Navigation className="size-4 mr-2" />
              )}
              Use Current
            </Button>
            {PRESET_LOCATIONS.map((preset) => (
              <Button
                key={preset.key}
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery(preset.label);
                  handleSearch();
                }}
                title={preset.label}
              >
                <preset.icon className="size-4" />
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Location</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search address, place, or landmark"
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="size-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => selectSearchResult(result)}
                  >
                    <p className="text-sm font-medium line-clamp-1">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {result.display_name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Location */}
          {location.latitude !== 0 && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={location.name}
                    onChange={(e) => setLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Location name"
                    className="font-medium mb-1"
                  />
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {location.address || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                  </p>
                </div>
              </div>

              {/* Trigger Type */}
              <div className="space-y-2">
                <Label className="text-xs">Remind me when I</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={location.triggerOn === 'ARRIVE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocation(prev => ({ ...prev, triggerOn: 'ARRIVE' }))}
                  >
                    Arrive
                  </Button>
                  <Button
                    type="button"
                    variant={location.triggerOn === 'LEAVE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocation(prev => ({ ...prev, triggerOn: 'LEAVE' }))}
                  >
                    Leave
                  </Button>
                </div>
              </div>

              {/* Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Detection Radius</Label>
                  <span className="text-xs font-medium">{location.radius}m</span>
                </div>
                <Slider
                  value={[location.radius]}
                  onValueChange={([value]) => setLocation(prev => ({ ...prev, radius: value }))}
                  min={50}
                  max={1000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>50m</span>
                  <span>1km</span>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Icon icon="solar:info-circle-linear" className="size-4 shrink-0 mt-0.5" />
            <p>
              Location reminders require the app to access your location in the background. 
              Battery usage will be minimal.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {value && (
            <Button variant="outline" onClick={handleClear} className="mr-auto">
              <X className="size-4 mr-1" />
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={location.latitude === 0}>
            <MapPin className="size-4 mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple trigger button for use in forms
interface LocationReminderButtonProps {
  value?: LocationReminder | null;
  onChange: (location: LocationReminder | null) => void;
}

export function LocationReminderButton({ value, onChange }: LocationReminderButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all",
          value && "text-primary border-primary/40 bg-primary/5"
        )}
      >
        <MapPin className="size-4 mr-1.5" />
        {value ? value.name : 'Location'}
      </Button>

      <LocationReminderEditor
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

export default LocationReminderEditor;
