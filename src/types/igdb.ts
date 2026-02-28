/**
 * IGDB API Type Definitions
 * Based on IGDB API v4 schema
 */

export interface Game {
  id: number;
  name: string;
  slug: string;
  alternative_names?: Array<{
    id: number;
    name: string;
  }>;
  involved_companies?: Array<{
    id: number;
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
    porting: boolean;
    supporting: boolean;
  }>;
  first_release_date?: number;
  platforms?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  status?: number;
  status_text?: string;
  summary?: string;
  genres?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  franchises?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  game_modes?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  player_perspectives?: number[];
  multiplayer_modes?: number[];
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  abbreviation?: string;
  category?: number;
  generation?: number;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  url?: string;
}

export interface Franchise {
  id: number;
  name: string;
  slug: string;
  url?: string;
  games?: number[];
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  country?: number;
  developed?: number[];
  published?: number[];
  logo?: {
    id: number;
    url: string;
    height: number;
    width: number;
  };
}

export interface GameMode {
  id: number;
  name: string;
  slug: string;
  url?: string;
}

export interface InvolvedCompany {
  id: number;
  company: Company;
  game: number;
  developer: boolean;
  publisher: boolean;
  porting: boolean;
  supporting: boolean;
}

export interface Cover {
  id: number;
  image_id: string;
  url?: string;
  width?: number;
  height?: number;
  alpha_channel?: boolean;
  game?: number;
}

export interface Screenshot {
  id: number;
  image_id: string;
  url?: string;
  width?: number;
  height?: number;
  game?: number;
}

export interface ReleaseDate {
  id: number;
  date?: number;
  human?: string;
  platform?: number;
  region?: number;
  created_at?: number;
}

export interface Artwork {
  id: number;
  image_id: string;
  url?: string;
  width?: number;
  height?: number;
  alpha_channel?: boolean;
  game?: number;
}

export interface Keyword {
  id: number;
  name: string;
  slug: string;
  url?: string;
}

export interface Theme {
  id: number;
  name: string;
  slug: string;
  url?: string;
}

export interface ExternalGame {
  id: number;
  name?: string;
  url?: string;
  category?: number;
  uid?: string;
  game?: number;
  platform?: number;
  created_at?: number;
  updated_at?: number;
}

export interface GameVideo {
  id: number;
  name?: string;
  video_id?: string;
  game?: number;
}

export interface PlayerPerspective {
  id: number;
  name: string;
  slug: string;
  url?: string;
}

export interface MultiplayerMode {
  id: number;
  game?: number;
  platform?: number;
  campaigncoop?: boolean;
  dropin?: boolean;
  lancoop?: boolean;
  massivemultiplayer?: boolean;
  offlinecoop?: boolean;
  offlinecoopmax?: number;
  offlinemax?: number;
  onlinecoop?: boolean;
  onlinecoopmax?: number;
  onlinemax?: number;
  splitscreen?: boolean;
  splitscreenonline?: boolean;
}

/**
 * Game Status Enum
 * 0 = Released, 1 = Alpha, 2 = Coming Soon, 3 = Cancelled, 4 = Rumored, 6 = Early Access
 */
export enum GameStatus {
  RELEASED = 0,
  ALPHA = 1,
  COMING_SOON = 2,
  CANCELLED = 3,
  RUMORED = 4,
  EARLY_ACCESS = 6
}

/**
 * Tool response format
 */
export interface ToolResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
}
