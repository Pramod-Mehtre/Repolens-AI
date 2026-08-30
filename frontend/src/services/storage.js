const STORAGE_KEY = 'repolens_history';
const MAX_HISTORY = 10;

export function saveToHistory(data) {
  try {
    const history = getHistory();
    const existingIndex = history.findIndex(h => h.metadata?.fullName === data.metadata?.fullName);
    
    const entry = {
      ...data,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.unshift(entry);
    }
    
    // Keep only last MAX_HISTORY entries
    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage write failed (e.g. private browsing / quota exceeded) — non-critical
  }
}

export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteFromHistory(fullName) {
  try {
    const history = getHistory();
    const filtered = history.filter(h => h.metadata?.fullName !== fullName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage clear failed — non-critical
  }
}
