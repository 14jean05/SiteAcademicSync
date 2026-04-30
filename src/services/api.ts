
import { Group, CalendarEvent } from '../types';

export const api = {
  async getGroups(): Promise<Group[]> {
    const res = await fetch('/api/groups');
    return res.json();
  },

  async createGroup(name: string): Promise<Group> {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async joinGroup(code: string): Promise<Group> {
    const res = await fetch(`/api/groups/${code.toUpperCase()}`);
    if (!res.ok) throw new Error('Group not found');
    return res.json();
  },

  async addEvent(groupId: string, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const res = await fetch(`/api/groups/${groupId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  }
};
