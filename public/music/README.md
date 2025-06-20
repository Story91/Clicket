# Background Music for Clicket

This folder contains background music files for the Clicket concert app.

## How to Add Music

### 1. **Free Sources for Royalty-Free Music:**

#### **YouTube Audio Library** (Recommended)
- Go to: https://studio.youtube.com/channel/UC.../music
- Filter by: "No attribution required"
- Download MP3 files
- Genres: Electronic, Rock, Pop, Ambient

#### **Freesound.org**
- Create free account: https://freesound.org/
- Search for: "electronic loop", "rock instrumental", "pop beat"
- Download CC0 (public domain) files

#### **Pixabay Music**
- Free account: https://pixabay.com/music/
- Download royalty-free tracks
- No attribution required

#### **Zapsplat** 
- Free account: https://www.zapsplat.com/
- Professional quality music
- Download MP3 format

### 2. **File Naming Convention:**
- `electronic-beat.mp3` - Upbeat electronic music
- `rock-energy.mp3` - High-energy rock music  
- `pop-beat.mp3` - Catchy pop music
- `ambient-chill.mp3` - Relaxing ambient music

### 3. **File Requirements:**
- Format: MP3
- Size: Keep under 5MB each for fast loading
- Length: 2-5 minutes (will loop automatically)
- Quality: 128kbps is sufficient for background music

### 4. **Current Playlist:**
The app expects these files:
- `/public/music/electronic-beat.mp3`
- `/public/music/rock-energy.mp3` 
- `/public/music/pop-beat.mp3`
- `/public/music/ambient-chill.mp3`

### 5. **Testing:**
After adding files, the music player will appear in the bottom-right corner of the app with:
- Play/Pause controls
- Track switching (Previous/Next)
- Volume control
- Current track display

### 6. **Fallback:**
If music files are missing, the player will still appear but won't play audio. No errors will be thrown.

## Legal Note
Only use royalty-free music or music you have proper licensing for. The sources above provide free-to-use music for commercial projects. 