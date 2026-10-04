/**
 * TalentSphere Multi-Entity Backend Search & Command Palette (⌘K) Domain
 * Features: F-20, F-34, F-32
 */
export type SearchEntityType = 'all' | 'jobs' | 'skills' | 'courses' | 'challenges' | 'profiles' | 'commands' | 'companies' | 'projects';
export interface SearchResultItem {
    id: string;
    type: 'job' | 'skill' | 'course' | 'challenge' | 'profile' | 'command' | 'company' | 'project';
    title: string;
    subtitle?: string;
    url: string;
    badge?: string;
    score: number;
    metadata?: Record<string, unknown>;
}
export interface CommandItem {
    id: string;
    title: string;
    shortcut?: string;
    section: 'navigation' | 'actions' | 'account' | 'admin';
    actionUrl: string;
    requiredRole?: string;
}
export interface SearchHistoryItem {
    id: string;
    userId: string;
    query: string;
    entityType: SearchEntityType;
    resultCount: number;
    createdAt: string;
}
export declare const BASE_COMMANDS: CommandItem[];
export declare function levenshteinDistance(a: string, b: string): number;
/**
 * Calculates a relevance score for a search term match against a query with typo tolerance (BR-266).
 * Exact match: 100
 * Prefix match: 85
 * Word match: 75
 * Word prefix match: 70
 * Substring match: 50
 * Fuzzy typo match: 35..45
 * No match: 0
 */
export declare function scoreSearchMatch(target: string, query: string): number;
export interface AutocompleteSuggestion {
    text: string;
    type: SearchResultItem['type'];
    score: number;
}
/**
 * Generates autocomplete suggestions with sub-100ms response expectation (BR-265).
 */
export declare function generateAutocompleteSuggestions(query: string, items: SearchResultItem[], limit?: number): AutocompleteSuggestion[];
/**
 * Ranks search results by relevance score descending, then title alphabetically.
 */
export declare function rankSearchResults(items: SearchResultItem[]): SearchResultItem[];
/**
 * Returns commands available to a user based on their active roles.
 */
export declare function getAvailableCommands(roles?: string[]): CommandItem[];
/**
 * Filters commands against a user's search query.
 */
export declare function filterCommandsByQuery(commands: CommandItem[], query: string): CommandItem[];
/**
 * Creates an immutable search history entry.
 */
export declare function createSearchHistoryRecord(userId: string, query: string, entityType?: SearchEntityType, resultCount?: number, nowIso?: string): SearchHistoryItem;
//# sourceMappingURL=search.d.ts.map