
export interface Track {
    name: string;
    path: string;
}

export interface Playlist {
    name: string;
    tracks: Track[];
}

export type MusicState = {
    playlists: Playlist[];
    currentPlaylist: string | null;
    currentTrackIndex: number;
    isPlaying: boolean;
    volume: number;
};
