---
title: "Turning a Linux Laptop into a Cloud Gaming Server with Sunshine & Moonlight"
description: "How I set up game streaming from my GTX 1650 laptop running Pop!_OS to any device using Sunshine, Moonlight, and Tailscale — including fixing NVIDIA Optimus encoding issues and optimizing for quality."
date: "Aug 18 2026"
spaces:
  - homelab
---

I wanted to play games on my MacBook without it melting, so I turned my GTX 1650 laptop running Pop!_OS into a personal cloud gaming server. The idea is simple — run games on the powerful GPU laptop, stream the video to any client device over the network. This post covers the full setup, the problems I hit, and how I solved them.

## The Setup

- **Server**: Laptop with Intel i7 (CoffeeLake) + NVIDIA GTX 1650, running Pop!_OS (Ubuntu 22.04 base)
- **Client**: MacBook Pro with Moonlight
- **Network**: Both on the same WiFi, plus Tailscale for remote access
- **Streaming Software**: [Sunshine](https://app.lizardbyte.dev) (server) + [Moonlight](https://moonlight-stream.org/) (client)
- **Game Launcher**: Heroic Games Launcher with Proton

## Installing Sunshine

Sunshine is a self-hosted game stream server compatible with NVIDIA's GameStream protocol. It's what Moonlight connects to.

```bash
# On Pop!_OS / Ubuntu 22.04
sudo apt install sunshine
```

After installation, Sunshine runs as a user systemd service:

```bash
systemctl --user enable app-dev.lizardbyte.app.Sunshine.service
systemctl --user start app-dev.lizardbyte.app.Sunshine.service
```

Access the web UI at `https://localhost:47990` to set up your username/password and pair clients.

## Installing Moonlight

On macOS, grab Moonlight from the [official site](https://moonlight-stream.org/) or via Homebrew:

```bash
brew install --cask moonlight
```

Open Moonlight, it should auto-discover the Sunshine server on your LAN. Enter the PIN shown in Moonlight into the Sunshine web UI to pair.

## The Problem: Stream Wouldn't Work

After pairing, Moonlight could see the server but streaming would fail — black screen, connection drops, or encoding errors. The Sunshine logs were full of:

```
[h264_nvenc] Multiple reference frames are not supported by the device
[h264_nvenc] Provided device doesn't support required NVENC features
Could not open codec [h264_nvenc]: Function not implemented
```

## Root Cause: NVIDIA Optimus + NVENC Mismatch

My laptop uses **NVIDIA Optimus** in `on-demand` mode (`prime-select query` → `on-demand`). This means:

1. The **Intel UHD 630** renders the desktop and drives the display (eDP-1)
2. The **NVIDIA GTX 1650** only activates when apps explicitly request it (`prime-run`)
3. Sunshine was configured with `encoder = nvenc` (NVIDIA) but `capture = x11` (capturing from Intel's framebuffer)

The frame path was: **Intel renders → X11 capture from Intel → copy to NVIDIA → NVENC encode**. This cross-GPU copy path caused the NVENC initialization to fail with the newer driver (580.x) on the GTX 1650's Turing encoder.

### Diagnosing It

```bash
# Check which GPU renders the desktop
glxinfo | grep "OpenGL renderer"
# → Mesa Intel(R) UHD Graphics 630 (CFL GT2)

# Check which GPU renders with prime offload
__NV_PRIME_RENDER_OFFLOAD=1 __GLX_VENDOR_LIBRARY_NAME=nvidia glxinfo | grep "OpenGL renderer"
# → NVIDIA GeForce GTX 1650/PCIe/SSE2

# Check where the display is physically connected
for card in /sys/class/drm/card*-*; do
  status=$(cat $card/status 2>/dev/null)
  if [ "$status" = "connected" ]; then
    echo "CONNECTED: $(basename $card)"
  fi
done
# → card1-eDP-1 (Intel!)
```

## The Fix: VAAPI Encoding + KMS Capture

Since the display lives on Intel, the cleanest solution is to **capture AND encode on Intel** using VAAPI (Video Acceleration API / QuickSync):

```bash
# ~/.config/sunshine/sunshine.conf
encoder = vaapi
capture = kms
adapter_name = /dev/dri/renderD128
output_name = 0
```

### Why this works:

- **KMS capture** grabs frames directly from the DRM/KMS framebuffer — more efficient than X11 capture and works correctly with Optimus
- **VAAPI encoder** uses Intel QuickSync hardware encoding on the same GPU that renders the display — no cross-GPU copy needed
- The Intel UHD 630 (CoffeeLake) has excellent H.264 and HEVC encoding support

### Prerequisites:

```bash
# Install VAAPI driver
sudo apt install intel-media-va-driver-non-free vainfo

# Verify it works
vainfo --display drm --device /dev/dri/renderD128
# Should show: Intel iHD driver with H264/HEVC encode profiles

# Ensure permissions
sudo usermod -aG video $USER
sudo usermod -aG input $USER

# Sunshine needs cap_sys_admin for KMS capture (usually set by the package)
getcap /usr/bin/sunshine
# → cap_sys_admin,cap_sys_nice=p
```

Restart Sunshine and the logs should show clean encoder initialization:

```
Info: Screencasting with KMS
Info: Found monitor for DRM screencasting
Info: Found connector ID [109]
Info: vaapi vendor: Intel iHD driver for Intel(R) Gen Graphics
Info: Found H.264 encoder: h264_vaapi [vaapi]
Info: Found HEVC encoder: hevc_vaapi [vaapi]
Info: Starting main loop
```

## Network: Tailscale for Remote Access

Both machines are on Tailscale, giving them stable IPs that work from anywhere:

```bash
# Server: 100.77.237.117
# Client: 100.93.10.100
```

When on the same LAN, Tailscale establishes a **direct connection** (no relay), so latency is effectively the same as raw LAN. You can verify:

```bash
tailscale status --json | python3 -c "
import json,sys
data=json.load(sys.stdin)
for k,v in data.get('Peer',{}).items():
    if v.get('CurAddr'):  # Direct connection
        print(f\"{v['HostName']}: DIRECT via {v['CurAddr']}\")
    elif v.get('Relay'):  # Relayed
        print(f\"{v['HostName']}: RELAYED via {v['Relay']}\")
"
```

To access the Sunshine web UI over Tailscale, add the Tailscale IP to allowed origins:

```bash
csrf_allowed_origins = https://192.168.29.77:47990 https://100.77.237.117:47990
```

## Firewall Configuration

Sunshine needs these ports open:

| Port | Protocol | Purpose |
|------|----------|---------|
| 47984-47990 | TCP | Control, HTTPS web UI, RTSP |
| 47998-48000 | UDP | Video stream |
| 48002 | UDP | Audio stream |
| 48010 | TCP | Video stream (TCP fallback) |

```bash
# If using firewalld (Pop!_OS)
sudo firewall-cmd --zone=public --add-port=47984-47990/tcp --permanent
sudo firewall-cmd --zone=public --add-port=47998-48000/udp --permanent
sudo firewall-cmd --zone=public --add-port=48002/udp --permanent
sudo firewall-cmd --zone=public --add-port=48010/tcp --permanent
sudo firewall-cmd --reload
```

Tailscale traffic bypasses firewalld via its own iptables rules, so no additional config needed for Tailscale connections.

## Optimizing Stream Quality

### Server side (`sunshine.conf`):

```bash
encoder = vaapi
capture = kms
adapter_name = /dev/dri/renderD128
output_name = 0

# Lower QP = higher quality (18-23 is good range)
qp = 20

# Forward error correction for WiFi reliability
fec_percentage = 20

# Maintain frame rate consistency
min_fps_factor = 1
```

### Client side (Moonlight settings):

| Setting | Recommended Value | Why |
|---------|------------------|-----|
| Resolution | 1080p | Match server's native display |
| Frame rate | 60 FPS | Smooth gameplay |
| Bitrate | 20-40 Mbps | LAN can handle it; higher = sharper |
| Video codec | HEVC (H.265) | Better quality per bit than H.264 |
| HDR | Off | Unless your display supports it |

On a good WiFi connection (5 GHz, signal > -50 dBm), you can push 40+ Mbps without issues. On 2.4 GHz, stay around 20 Mbps.

## Gaming with Proton (Heroic Games Launcher)

For running Windows games via Heroic + Proton on the server:

### Performance environment variables:

In Heroic → Game Settings → Environment Variables:

```
DXVK_ASYNC=1              # Background shader compilation (no stutter)
DXVK_STATE_CACHE=1        # Cache compiled shaders to disk
WINE_FULLSCREEN_FSR=1     # AMD FSR upscaling for free FPS
```

### DXVK config (`dxvk.conf` in game directory):

```ini
dxvk.enableAsync = True
dxvk.numCompilerThreads = 4
dxvk.numAsyncThreads = 2
```

### Why "Preparing Shaders" takes forever:

When a game first launches under Proton/DXVK, it compiles DirectX shaders into Vulkan shaders optimized for your GPU. This is **CPU-intensive** (you'll see 100% CPU, low GPU usage) and happens once per game per driver version. `DXVK_ASYNC=1` makes this happen in the background during gameplay instead of blocking.

### Recommended in-game settings for CPU-heavy games:

- **Textures**: High/Ultra (uses GPU VRAM, not CPU)
- **Draw Distance**: Medium (reduces CPU streaming load)
- **Population/NPC Density**: Low-Medium (major CPU saver)
- **Ray Tracing**: Off (GTX 1650 doesn't have dedicated RT cores)
- **Resolution**: Native 1080p or use FSR to render at 720p and upscale

## Controller Support

Moonlight passes controller input from the client to the server. Any controller connected to your Mac (Bluetooth or USB) appears as a virtual Xbox One pad on the server via Sunshine's uinput emulation.

### Setup:

```bash
# Load uinput module
sudo modprobe uinput
echo "uinput" | sudo tee /etc/modules-load.d/uinput.conf

# Udev rule for access
echo 'KERNEL=="uinput", SUBSYSTEM=="misc", OPTIONS+="static_node=uinput", TAG+="uaccess"' | \
  sudo tee /etc/udev/rules.d/85-sunshine-input.rules
sudo udevadm control --reload-rules

# Add user to input group
sudo usermod -aG input $USER
```

Supported controllers (all work over Moonlight):
- Xbox One / Series X|S (Bluetooth or USB)
- PS4 DualShock / PS5 DualSense
- Nintendo Switch Pro Controller
- Any MFi controller on macOS

## Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (MacBook)                                        │
│  Moonlight → Controller input → Network                 │
│  ← Decoded video/audio stream                           │
└──────────────────────┬──────────────────────────────────┘
                       │ Tailscale / LAN
┌──────────────────────▼──────────────────────────────────┐
│  SERVER (Pop!_OS Laptop)                                 │
│                                                          │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Game   │───▶│ Intel UHD630 │───▶│  VAAPI Enc   │   │
│  │ (Proton)│    │  (Display +  │    │  (H.264/HEVC)│   │
│  └─────────┘    │  KMS Capture)│    └──────┬───────┘   │
│       │         └──────────────┘           │            │
│       ▼                                    ▼            │
│  ┌─────────┐                        ┌──────────┐       │
│  │GTX 1650 │                        │ Sunshine │       │
│  │(Renders │                        │ (Stream) │       │
│  │via Prime)│                        └──────────┘       │
│  └─────────┘                                            │
└─────────────────────────────────────────────────────────┘
```

## Tips & Lessons Learned

1. **Don't fight Optimus** — if your display is on Intel, encode on Intel. VAAPI/QuickSync is plenty fast for 1080p60.
2. **KMS > X11 capture** — more reliable, works with Optimus, lower latency.
3. **Tailscale makes remote gaming trivial** — stable IPs, NAT traversal, direct connections on LAN.
4. **First shader compile is slow** — let it finish once, then gameplay is smooth forever.
5. **Monitor GPU temps** — laptop GPUs throttle at 85°C+. Use a cooling pad for long sessions.
6. **5 GHz WiFi matters** — 2.4 GHz works but limits bitrate. 5 GHz gives you headroom for 40+ Mbps streams.
7. **HEVC > H.264** at the same bitrate — less compression artifacts, especially in fast motion.

## Useful Commands

```bash
# Check which GPU renders your display
glxinfo | grep "OpenGL renderer"

# Check Sunshine status
systemctl --user status app-dev.lizardbyte.app.Sunshine.service

# Watch Sunshine logs live
journalctl --user -u app-dev.lizardbyte.app.Sunshine.service -f

# Monitor GPU during gaming
watch -n1 nvidia-smi

# Check VAAPI support
vainfo --display drm --device /dev/dri/renderD128

# Find which DRM card has your display
for card in /sys/class/drm/card*-*; do
  echo "$(basename $card): $(cat $card/status 2>/dev/null)"
done
```

---

What started as "just install Sunshine and go" turned into a deep dive into Linux GPU architecture, NVIDIA Optimus quirks, and video encoding pipelines. But the end result is worth it — lag-free 1080p60 game streaming to any device, anywhere, over Tailscale. Basically my own GeForce NOW.
