import { useState, useEffect } from 'react';
import {
  EVENTS, DONORS, PROJECTS, STORIES, LOCATIONS,
} from '../data/initialData';
import type { Event, Donor, Project, Story, Location } from '../data/initialData';
import { supabase } from '../lib/supabase';

export type { Event, Donor, Project, Story, Location };

export const STORAGE_KEYS = {
  events: 'fmt_events',
  donors: 'fmt_donors',
  projects: 'fmt_projects',
  stories: 'fmt_stories',
  locations: 'fmt_locations',
} as const;

// Kept for fallback / export feature
export function readLS<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}
export function saveLS<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('fmt-data-changed'));
}

// Row transforms (DB snake_case → TS interface)
export function rowToEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    description: row.description,
    location: row.location,
    type: row.type,
    phone: row.phone ?? undefined,
    ctaLabel: row.cta_label ?? undefined,
    ctaUrl: row.cta_url ?? undefined,
    deadline: row.deadline ?? undefined,
  };
}

export function rowToLocation(row: any): Location {
  return {
    id: String(row.id),
    name: row.name,
    district: row.district,
    impact: row.impact,
    amount: row.amount,
    lat: row.lat,
    lng: row.lng,
    demographics: row.demographics || { students: '', lowIncome: '', diversity: '' },
    projects: row.projects || [],
  };
}

function useSupabaseArray<T>(
  table: string,
  fallback: T[],
  transform?: (row: any) => T,
): T[] {
  const [data, setData] = useState<T[]>(fallback);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      const { data: rows, error } = await supabase.from(table).select('*').order('id');
      if (!error && rows && rows.length > 0) {
        setData(transform ? rows.map(transform) : (rows as unknown as T[]));
      }
    };
    fetchData();
    window.addEventListener('fmt-data-changed', fetchData);
    return () => window.removeEventListener('fmt-data-changed', fetchData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

export const useEvents    = () => useSupabaseArray<Event>('events', EVENTS, rowToEvent);
export const useDonors    = () => useSupabaseArray<Donor>('donors', DONORS);
export const useProjects  = () => useSupabaseArray<Project>('projects', PROJECTS);
export const useStories   = () => useSupabaseArray<Story>('stories', STORIES);
export const useLocations = () => useSupabaseArray<Location>('locations', LOCATIONS, rowToLocation);
