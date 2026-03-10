import { useState, useEffect } from 'react';
import {
  EVENTS, DONORS, PROJECTS, STORIES, LOCATIONS,
} from '../data/initialData';
import type { Event, Donor, Project, Story, Location } from '../data/initialData';

export type { Event, Donor, Project, Story, Location };

export const STORAGE_KEYS = {
  events: 'fmt_events',
  donors: 'fmt_donors',
  projects: 'fmt_projects',
  stories: 'fmt_stories',
  locations: 'fmt_locations',
} as const;

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

function useLocalArray<T>(key: string, fallback: T[]): T[] {
  const [data, setData] = useState<T[]>(() => readLS(key, fallback));

  useEffect(() => {
    const handler = () => setData(readLS(key, fallback));
    window.addEventListener('fmt-data-changed', handler);
    return () => window.removeEventListener('fmt-data-changed', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

export const useEvents    = () => useLocalArray<Event>(STORAGE_KEYS.events, EVENTS);
export const useDonors    = () => useLocalArray<Donor>(STORAGE_KEYS.donors, DONORS);
export const useProjects  = () => useLocalArray<Project>(STORAGE_KEYS.projects, PROJECTS);
export const useStories   = () => useLocalArray<Story>(STORAGE_KEYS.stories, STORIES);
export const useLocations = () => useLocalArray<Location>(STORAGE_KEYS.locations, LOCATIONS);
