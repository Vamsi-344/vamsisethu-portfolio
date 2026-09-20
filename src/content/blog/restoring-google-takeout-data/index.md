---
title: "Restoring Google Takeout Data Back to Google Services — The Complete Guide"
description: "How I uploaded ~25GB of Google Takeout data (Drive + Photos) back to Google services with correct dates, GPS metadata, and album structure preserved using CLI tools."
date: "Aug 08 2026"
---

I recently needed to restore my Google Takeout export back to Google services. What sounds simple — "just upload it back" — turned into a full-day adventure involving metadata preservation, EXIF manipulation, and OAuth API configuration. Here's everything I learned.

## The Problem

Google Takeout gives you a zip dump of your data. But uploading it back isn't straightforward:

- **Google Drive** files lose their modification dates if you just copy them
- **Google Photos** exports come with `.json` sidecar files containing dates and GPS, but the photos themselves often lack EXIF data
- Album structure is stored as folder names, not in a format Google Photos can import
- Videos almost never have EXIF dates — Google Photos shows them as "uploaded today"

## What I Had

- 1 zip (~5.5GB) containing **Google Drive** files
- 2 zips (~10GB each) containing **Google Photos** — about 7,000 photos spanning 2017–2023

## Part 1: Restoring Google Drive

### The Trap

If you upload the `Takeout/Drive/` folder directly, you get a nested "Drive" folder inside Google Drive. Upload the **contents**, not the folder.

### The Solution

I had Google Drive Desktop already installed, so I found my sync folder:

```bash
# Find your Google Drive folder
ls ~/Library/CloudStorage/
# Mine was at:
# ~/Library/CloudStorage/GoogleDrive-sethuvamsikrishna@gmail.com/My Drive/
```

Then used `rsync -a` to preserve timestamps:

```bash
rsync -a "/path/to/Takeout/Drive/" \
  "~/Library/CloudStorage/GoogleDrive-<email>/My Drive/"
```

**Why `rsync -a` instead of `cp`?** Plain `cp` resets modification dates to "now". The `-a` flag preserves timestamps, permissions, and recursively copies. The Drive desktop app then syncs with correct dates.

### What's Lost Permanently

Sharing permissions, comments, starred status, and version history. Google Takeout doesn't export these.

---

## Part 2: Restoring Google Photos

This is where it gets complex.

### Tools Required

```bash
# Organizes Takeout mess into clean chronological folders
# Download from: https://github.com/TheLastGimbus/GooglePhotosTakeoutHelper/releases
curl -sL "https://github.com/TheLastGimbus/GooglePhotosTakeoutHelper/releases/latest/download/gpth-macos" -o gpth-macos
chmod +x gpth-macos
xattr -r -d com.apple.quarantine gpth-macos  # macOS only

# Writes dates into photo/video EXIF metadata
brew install exiftool

# Uploads to Google Photos via API with album support
brew install gphotos-uploader-cli
```

### Step 1: Extract One Zip at a Time

I only had 25GB free disk space, so I couldn't extract both 10GB zips simultaneously.

```bash
unzip -q "takeout-001.zip" -d "photos_extracted"
```

### Step 2: Organize with gpth

[GooglePhotosTakeoutHelper](https://github.com/TheLastGimbus/GooglePhotosTakeoutHelper) is purpose-built for this. It reads the `.json` sidecar files, determines correct dates, handles duplicate filenames, and organizes everything.

```bash
./gpth-macos --no-interactive \
  --input "photos_extracted/Takeout/Google Photos" \
  --output "photos_output" \
  --albums shortcut \
  --copy \
  --divide-to-dates
```

This produces:
- `ALL_PHOTOS/2021/04/photo.jpg` — chronological organization
- `My-Album/2020/10/photo.jpg` — album folders with symlinks to ALL_PHOTOS

**Key flags:**
- `--albums shortcut` — creates album folders with symlinks (saves space)
- `--copy` — doesn't destroy your input folder
- `--divide-to-dates` — organizes by year/month

### Step 3: The Critical Fix — EXIF Dates

**This is the step most guides miss.**

`gpth` sets correct **file modification dates** but NOT **EXIF metadata**. Google Photos reads EXIF dates, not file dates. Without this step, hundreds of photos (especially videos) show up as "uploaded today."

```bash
exiftool -overwrite_original -r \
  -if 'not defined $DateTimeOriginal' \
  -P "-AllDates<FileModifyDate" \
  "photos_output/ALL_PHOTOS/"
```

This writes the file's modification date (which `gpth` set correctly from JSON metadata) into the EXIF `DateTimeOriginal` field — but only for files that don't already have one.

In my case, **1,400+ files** were missing EXIF dates (mostly videos, screenshots, and downloaded images).

### Step 4: Set Up gphotos-uploader-cli

This requires a Google Cloud project with Photos Library API enabled.

**One-time setup:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project
3. Enable **Photos Library API** (APIs & Services → Library)
4. Set up OAuth consent screen (External, add yourself as test user)
5. Create credentials: OAuth client ID → Desktop app
6. Note the Client ID and Client Secret

**Configuration** (`~/.gphotos-uploader-cli/config.hjson`):

```hjson
{
  APIAppCredentials: {
    ClientID: "YOUR_CLIENT_ID"
    ClientSecret: "YOUR_CLIENT_SECRET"
  }
  Account: "your@gmail.com"
  SecretsBackendType: "file"
  Jobs: [
    {
      // All photos to timeline (no album)
      SourceFolder: "/path/to/photos_output/ALL_PHOTOS"
      DeleteAfterUpload: false
      IncludePatterns: ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.gif",
                        "**/*.mp4", "**/*.mkv", "**/*.mov", "**/*.heic"]
      ExcludePatterns: []
    }
    {
      // Named album
      SourceFolder: "/path/to/photos_output/My-Album"
      Album: "name:My-Album"
      DeleteAfterUpload: false
      IncludePatterns: ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.gif",
                        "**/*.mp4", "**/*.mkv", "**/*.mov", "**/*.heic"]
      ExcludePatterns: []
    }
    // ... repeat for each album folder
  ]
}
```

**Config explained:**
- First job uploads all photos to the timeline without any album
- Additional jobs upload album-folder photos into named albums
- Google Photos deduplicates — same photo won't appear twice, it just gets added to the album

### Step 5: Authenticate and Upload

```bash
gphotos-uploader-cli auth   # Opens browser for Google OAuth
gphotos-uploader-cli push   # Starts upload
```

The first time it asks for a passphrase to encrypt the token store locally.

### Step 6: Repeat for Next Zip

```bash
# Clean up
rm -rf photos_extracted photos_output

# Reset upload tracker
rm -rf ~/.gphotos-uploader-cli/uploaded_files
rm -rf ~/.gphotos-uploader-cli/ongoing_uploads

# Extract next zip and repeat from Step 2
```

---

## Gotchas I Hit Along the Way

### 1. `cp` destroys timestamps
Always use `rsync -a` for Drive files. Learned this after my first copy lost all dates.

### 2. `gpth` ≠ EXIF fix
`gpth` sets **file** modification dates. Google Photos reads **EXIF** dates. You MUST run `exiftool` after `gpth`. This one caused hours of confusion.

### 3. Album naming with `gphotos-uploader-cli`
- `template:%_directory%` uses the immediate parent folder name. If your structure is `ALL_PHOTOS/2021/12/photo.jpg`, the album becomes "12" (the month). Not useful.
- Use `name:AlbumName` for explicit album names.
- The `auto:folderName` option exists in newer versions but wasn't available in v5.1.0.

### 4. GIF files ignore EXIF
Google Photos doesn't read EXIF dates from `.gif` files. They always show the upload date. Manual date edit in the Google Photos UI is the only fix.

### 5. OAuth consent screen requires test users
If your Cloud project is in "Testing" mode, you must add your own email as a test user before auth works.

### 6. Videos almost never have EXIF dates
Out of 4,800 files, 1,400+ were missing dates — almost all videos. The `exiftool` step is non-negotiable.

### 7. Google Photos API 409 errors
Occasional `409: aborted` errors are normal. Just re-run `gphotos-uploader-cli push` — it skips already-uploaded files and retries failures.

---

## Final Results

| Metric | Value |
|--------|-------|
| Total photos restored | ~7,000 |
| Drive files restored | ~40 files + folders |
| Albums recreated | 10+ |
| Files needing EXIF fix | ~1,800 |
| Files with unfixable dates | ~20 (GIFs + PNGs) |
| Total data processed | ~25GB |
| Time spent | ~6 hours (including learning) |

---

## The Ideal Pipeline (TL;DR)

```bash
# 1. Drive — rsync to Google Drive Desktop folder
rsync -a "Takeout/Drive/" "~/Library/CloudStorage/GoogleDrive-<email>/My Drive/"

# 2. Photos — organize with gpth
./gpth-macos --no-interactive --input "Takeout/Google Photos" \
  --output "photos_output" --albums shortcut --copy --divide-to-dates

# 3. Photos — fix EXIF (THE CRITICAL STEP)
exiftool -overwrite_original -r -if 'not defined $DateTimeOriginal' \
  -P "-AllDates<FileModifyDate" "photos_output/ALL_PHOTOS/"

# 4. Photos — upload with albums
gphotos-uploader-cli push
```

Four commands. That's all you need — once you know them.

---

## Tools Used

- [GooglePhotosTakeoutHelper (gpth)](https://github.com/TheLastGimbus/GooglePhotosTakeoutHelper) — organizes Takeout photos
- [exiftool](https://exiftool.sourceforge.net/) — manipulates photo/video metadata
- [gphotos-uploader-cli](https://github.com/gphotosuploader/gphotos-uploader-cli) — uploads to Google Photos via API
- Google Drive Desktop App — syncs Drive files
