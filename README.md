# C++ Web IDE

Tarayıcı tabanlı, çoklu dosya destekli, GUI uygulamaları çalıştırabilen bir C++ geliştirme ortamı.

Browser-based C++ development environment with multi-file support and GUI application execution.

---

## Gereksinimler / Requirements

- **Node.js** (v14+) - [nodejs.org](https://nodejs.org)
- **g++** - GNU C++ derleyicisi / GNU C++ compiler

| Paket / Package | Linux (Ubuntu/Debian) | Windows |
|---|---|---|
| g++ | `sudo apt install g++` | [MSYS2](https://www.msys2.org/) veya [MinGW-w64](https://www.mingw-w64.org/) ile `pacman -S mingw-w64-x86_64-gcc` |
| Xvfb | `sudo apt install xvfb` | Gerekmez / Not needed (doğrudan çalışır / runs natively) |
| ImageMagick | `sudo apt install imagemagick` | Gerekmez / Not needed |
| x11vnc | `sudo apt install x11vnc` | Gerekmez / Not needed |
| noVNC | `sudo apt install novnc` | Gerekmez / Not needed |
| websockify | `sudo apt install websockify` | `pip install websockify` |
| SDL2 dev | `sudo apt install libsdl2-dev` | MSYS2: `pacman -S mingw-w64-x86_64-SDL2` |
| OpenGL/GLU | `sudo apt install libgl1-mesa-dev libglu1-mesa-dev` | Genellikle GPU sürücüsü ile gelir / Usually bundled with GPU drivers |

---

## Hızlı Kurulum / Quick Setup

### Linux (Ubuntu/Debian)

```bash
# Tüm bağımlılıkları kur / Install all dependencies
sudo apt-get update
sudo apt-get install -y g++ nodejs npm xvfb imagemagick x11vnc novnc websockify \
    libsdl2-dev libsdl2-ttf-dev libsdl2-image-dev libsdl2-mixer-dev \
    libgl1-mesa-dev libglu1-mesa-dev freeglut3-dev libgtk-3-dev libsfml-dev

# Proje dizinine git / Go to project directory
cd "C webspace"

# Node.js bağımlılıklarını kur / Install Node.js dependencies
npm install

# Sunucuyu başlat / Start the server
npm start
```

### Windows

#### 1. Node.js Kurulumu / Node.js Installation
[https://nodejs.org](https://nodejs.org) adresinden LTS sürümünü indirip kurun.
Download and install the LTS version from [https://nodejs.org](https://nodejs.org).

#### 2. g++ Kurulumu / g++ Installation

**Seçenek A - MSYS2 (Önerilen / Recommended):**

```bash
# MSYS2'yi indirin ve kurun / Download and install MSYS2 from https://www.msys2.org
# MSYS2 terminalsinden çalıştırın / Run from MSYS2 terminal:

pacman -S mingw-w64-x86_64-gcc
```

`C:\msys64\mingw64\bin` yolunu Sistem PATH'e ekleyin.
Add `C:\msys64\mingw64\bin` to system PATH.

**Seçenek B - MinGW-w64:**
[https://www.mingw-w64.org/](https://www.mingw-w64.org/) adresinden indirip kurun.
Download and install from [https://www.mingw-w64.org/](https://www.mingw-w64.org/).

**Seçenek C - WSL (Windows Subsystem for Linux):**
Linux talimatlarını WSL üzerinde çalıştırabilirsiniz.
You can run the Linux instructions inside WSL.

#### 3. Projeyi Çalıştırın / Run the Project

```powershell
cd "C webspace"
npm install
npm start
```

### macOS

```bash
# Xcode komut satırı araçlarını kurun / Install Xcode command line tools
xcode-select --install

# Homebrew ile bağımlılıkları kur / Install dependencies with Homebrew
brew install node sdl2 sdl2_ttf sdl2_image sdl2_mixer freeglut

# Proje dizinine git ve başlat / Go to project and start
cd "C webspace"
npm install
npm start
```

---

## Tarayıcıda Açma / Open in Browser

**http://localhost:3000**

---

## Özellikler / Features

### Editör / Editor
- Monaco Editor (VS Code editör motoru / VS Code editor engine)
- C++ sözdizimi renklendirmesi / C++ syntax highlighting
- Otomatik tamamlama / Auto-completion
- Klavye kısayolu: `Ctrl+Enter` ile çalıştır / Run with `Ctrl+Enter`

### Dosya Yönetimi / File Management
- `+` butonu ile yeni dosya oluştur / Create new files with `+` button
- Çoklu sekme desteği / Multi-tab support
- Dosyalar arası geçiş / Switch between files
- `x` ile dosya kapatma / Close files with `x`
- `main.cpp` dahil tüm dosyalar silinebilir / All files including `main.cpp` can be deleted

### Çalıştırma Modları / Run Modes

#### Terminal Modu / Terminal Mode
Konsol çıktısı olan programlar için / For programs with console output:

```cpp
#include <iostream>
int main() {
    std::cout << "Merhaba Dunya!" << std::endl;
    return 0;
}
```

#### GUI Modu / GUI Mode
Grafik arayüzlü programlar için (SDL2, GLUT, GTK, OpenGL) / For graphical programs (SDL2, GLUT, GTK, OpenGL):

Editör araç çubuğundaki **GUI** toggle'ını açın / Enable the **GUI** toggle in the editor toolbar

```cpp
#include <SDL2/SDL.h>
int main(int argc, char* argv[]) {
    SDL_Init(SDL_INIT_VIDEO);
    SDL_Window* window = SDL_CreateWindow("Pencere",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        800, 600, SDL_WINDOW_SHOWN);
    SDL_Delay(3000);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
```

- GUI programları yeni pencerede açılır / GUI programs open in a new window
- Çözünürlük seçilebilir: 1280x720, 1600x900, 1920x1080, 2560x1440 / Resolution selectable
- **Durdur** butonu ile sonlandırılabilir / Can be stopped with the **Stop** button
- Windows'ta doğrudan çalışır (Xvfb gerekmez) / Runs natively on Windows (no Xvfb needed)

### Tema / Theme
- Açık ve karanlık mod desteği / Light and dark mode support
- Üst çubuktaki güneş/ay ikonu ile geçiş / Toggle with sun/moon icon in the top bar
- Tercih otomatik kaydedilir / Preference saved automatically

### Konsol / Console
- Zaman damgası ile çıktı / Timestamped output
- Hata/başarı durumu badge'i / Error/success status badge
- Alt çubukta durum göstergesi / Status indicator in the bottom bar

### Veri Kaybı Önleme / Data Loss Prevention
- Kodlar `localStorage`'a otomatik kaydedilir / Code auto-saved to `localStorage`
- Sayfa yenilendiğinde tüm dosyalar geri gelir / All files restored on page refresh
- Sekme tercihi ve GUI modu hatırlanır / Tab preference and GUI mode remembered

---

## Desteklenen Kütüphaneler / Supported Libraries

Sunucu başlatıldığında otomatik algılanır / Auto-detected on server start:

| Kütüphane / Library | Linux Paketi / Linux Package | Windows (MSYS2) |
|---|---|---|
| SDL2 | `libsdl2-dev` | `mingw-w64-x86_64-SDL2` |
| SDL2_ttf | `libsdl2-ttf-dev` | `mingw-w64-x86_64-SDL2_ttf` |
| SDL2_image | `libsdl2-image-dev` | `mingw-w64-x86_64-SDL2_image` |
| SDL2_mixer | `libsdl2-mixer-dev` | `mingw-w64-x86_64-SDL2_mixer` |
| OpenGL / GLU | `libgl1-mesa-dev`, `libglu1-mesa-dev` | GPU sürücüsü ile gelir / Bundled with GPU drivers |
| GLUT / FreeGLUT | `freeglut3-dev` | `mingw-w64-x86_64-freeglut` |
| GTK+ 3 | `libgtk-3-dev` | `mingw-w64-x86_64-gtk3` |
| SFML | `libsfml-dev` | `mingw-w64-x86_64-SFML` |

---

## Platform Farkları / Platform Differences

| Özellik / Feature | Linux | Windows | macOS |
|---|---|---|---|
| Terminal çalıştırma / Terminal execution | Tam destek / Full support | Tam destek / Full support | Tam destek / Full support |
| GUI çalıştırma / GUI execution | Xvfb + VNC (sanal ekran) / Xvfb + VNC (virtual screen) | Doğrudan çalışır / Runs natively | Doğrudan çalışır / Runs natively |
| Etkileşimli GUI / Interactive GUI | VNC penceresi / VNC window | Yeni pencere / New window | Yeni pencere / New window |
| Varsayılan derleyici / Default compiler | g++ | g++ (MSYS2/MinGW) | g++ (Xcode CLT) |

---

## Proje Yapısı / Project Structure

```
C webspace/
├── server.js          # Express sunucu / Express server
├── package.json       # Node.js bağımlılıkları / Node.js dependencies
├── README.md          # Bu dosya / This file
├── public/
│   └── index.html     # Ana arayüz / Main interface
└── temp/              # Geçici derleme dosyaları / Temporary build files
```

---

## API

| Endpoint | Method | Açıklama / Description |
|---|---|---|
| `/run` | POST | Kodu derle ve çalıştır / Compile and run code |
| `/stop` | POST | Çalışan GUI session'ını sonlandır / Stop running GUI session |
| `/check-tools` | GET | Araçların kurulu olup olmadığını kontrol et / Check if tools are installed |

### /run İsteği / Request

```json
{
  "code": "#include <iostream>\nint main(){return 0;}",
  "gui": false,
  "resolution": "1920x1080"
}
```

### /run Yanıtı / Response

```json
{
  "output": "Merhaba Dunya!",
  "isError": false,
  "vncUrl": "http://localhost:6080/vnc.html?autoconnect=true",
  "sessionId": "abc123",
  "interactive": true
}
```

---

## Sorun Giderme / Troubleshooting

| Sorun / Problem | Çözüm / Solution |
|---|---|
| `g++: command not found` | g++ kurulumu yapılmamış / g++ not installed. ilgili platform talimatlarını uygulayın / follow platform instructions above |
| `Cannot find module 'express'` | `npm install` çalıştırın / Run `npm install` |
| Port 3000 kullanımda | `PORT` değişkenini değiştirin / Change the `PORT` variable in `server.js` |
| GUI penceresi açılmıyor (Linux) | `x11vnc` ve `novnc` kurulu mu kontrol edin / Check if `x11vnc` and `novnc` are installed |
| SDL2 header bulunamadı | `libsdl2-dev` (Linux) veya MSYS2 ile SDL2 kurun / Install `libsdl2-dev` (Linux) or SDL2 via MSYS2 |
| Wayland hatası (Linux) | `WAYLAND_DISPLAY` değişkeni otomatik temizlenir, manuel olarak da unset edebilirsiniz / `WAYLAND_DISPLAY` is auto-cleaned, you can also unset manually |

---

## Lisans / License

ISC
