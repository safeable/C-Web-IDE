const express = require('express');
const cors = require('cors');
const { exec, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

const TEMP_DIR = path.join(__dirname, 'temp');
const TIMEOUT_MS = 5000;
const GUI_TIMEOUT_MS = 15000;
const MAX_CODE_LENGTH = 50000;
const NOVNC_PATH = '/usr/share/novnc';

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

let activeSessions = {};

function detectGuiFlags() {
    const flags = [];
    const includes = [];
    try {
        const sdl2 = require('child_process').execSync('sdl2-config --cflags --libs 2>/dev/null', { encoding: 'utf8' }).trim();
        if (sdl2) sdl2.split(/\s+/).forEach(f => { if (f.startsWith('-I')) includes.push(f); else flags.push(f); });
    } catch (_) {}
    const pkgLibs = ['SDL2_ttf', 'SDL2_image', 'SDL2_mixer', 'SDL2_gfx', 'glut', 'glu', 'gl'];
    pkgLibs.forEach(lib => {
        try {
            const out = require('child_process').execSync(`pkg-config --libs ${lib} 2>/dev/null`, { encoding: 'utf8' }).trim();
            if (out) out.split(/\s+/).forEach(f => { if (!flags.includes(f)) flags.push(f); });
        } catch (_) {}
    });
    if (!flags.includes('-lGL')) flags.push('-lGL');
    if (!flags.includes('-lGLU')) flags.push('-lGLU');
    if (!flags.includes('-lpthread')) flags.push('-lpthread');
    return { flags, includes };
}

const GUI_COMPILE_FLAGS = detectGuiFlags();
console.log('Algılanan GUI bayrakları:', GUI_COMPILE_FLAGS.flags.join(' '));

function cleanupTempFiles(baseName) {
    try {
        const files = fs.readdirSync(TEMP_DIR);
        for (const file of files) {
            if (file.startsWith(baseName)) {
                const filePath = path.join(TEMP_DIR, file);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }
    } catch (_) {}
}

function killSession(sessionId) {
    const s = activeSessions[sessionId];
    if (!s) return;
    try { if (s.appPid) process.kill(-s.appPid, 'SIGTERM'); } catch (_) {}
    try { if (s.appPid) process.kill(s.appPid, 'SIGTERM'); } catch (_) {}
    try { if (s.vncPid) process.kill(s.vncPid, 'SIGTERM'); } catch (_) {}
    try { if (s.wsPid) process.kill(s.wsPid, 'SIGTERM'); } catch (_) {}
    try { exec(`pkill -f "Xvfb :${s.display}"`); } catch (_) {}
    cleanupTempFiles(s.baseName);
    delete activeSessions[sessionId];
}

app.post('/stop', (req, res) => {
    const sessionId = req.body.sessionId;
    if (sessionId && activeSessions[sessionId]) {
        killSession(sessionId);
        return res.json({ ok: true });
    }
    res.json({ ok: false });
});

app.post('/run', (req, res) => {
    const code = req.body.code;
    const guiMode = req.body.gui === true;
    const resolution = (req.body.resolution || '1920x1080').split('x');
    const resW = parseInt(resolution[0]) || 1920;
    const resH = parseInt(resolution[1]) || 1080;

    if (typeof code !== 'string' || code.trim().length === 0) {
        return res.json({ output: 'Hata: Kod bos gonderilemez.', isError: true });
    }

    if (code.length > MAX_CODE_LENGTH) {
        return res.json({ output: `Hata: Kod cok uzun (maks ${MAX_CODE_LENGTH} karakter).`, isError: true });
    }

    const uid = crypto.randomBytes(8).toString('hex');
    const baseName = `main_${uid}`;
    const sourceFile = path.join(TEMP_DIR, `${baseName}.cpp`);
    const outputFile = path.join(TEMP_DIR, baseName);

    const compileFlags = guiMode
        ? [sourceFile, '-o', outputFile, '-std=c++17', '-Wall', ...GUI_COMPILE_FLAGS.includes, ...GUI_COMPILE_FLAGS.flags]
        : [sourceFile, '-o', outputFile, '-std=c++17', '-Wall'];

    fs.writeFile(sourceFile, code, (err) => {
        if (err) {
            cleanupTempFiles(baseName);
            return res.json({ output: 'Hata: Dosya yazma hatasi.', isError: true });
        }

        execFile('g++', compileFlags, { timeout: 15000 }, (compileErr, stdout, stderr) => {
            if (compileErr) {
                cleanupTempFiles(baseName);
                return res.json({ output: stderr || stdout || 'Derleme hatasi.', isError: true });
            }

            if (!guiMode) {
                execFile(outputFile, [], { timeout: TIMEOUT_MS, maxBuffer: 1024 * 512 }, (runErr, runStdout, runStderr) => {
                    cleanupTempFiles(baseName);
                    if (runErr) {
                        if (runErr.killed) return res.json({ output: 'Hata: Program zaman asimina ugradi.', isError: true });
                        return res.json({ output: runStderr || runErr.message, isError: true });
                    }
                    res.json({ output: runStdout || runStderr || '', isError: false });
                });
            } else {
                const displayNum = Math.floor(Math.random() * 400) + 200;
                const vncPort = 5900 + Math.floor(Math.random() * 100);
                const wsPort = 6080 + Math.floor(Math.random() * 100);
                const sessionId = uid;

                const startXvfb = `Xvfb :${displayNum} -screen 0 ${resW}x${resH}x24 -ac +extension GLX +render -noreset`;
                const startVnc = `x11vnc -display :${displayNum} -forever -nopw -shared -rfbport ${vncPort} -bg -o /tmp/x11vnc_${uid}.log`;
                const startWs = `websockify --web=${NOVNC_PATH} ${wsPort} localhost:${vncPort}`;

                const cleanEnv = { ...process.env };
                delete cleanEnv.WAYLAND_DISPLAY;
                delete cleanEnv.XDG_SESSION_TYPE;

                const startXvfbProc = exec(startXvfb, { timeout: 5000 }, (e) => {});
                const sessionIdVal = sessionId;

                setTimeout(() => {
                    exec(startVnc, { timeout: 5000, env: cleanEnv }, (vncErr) => {
                        if (vncErr) {
                            cleanupTempFiles(baseName);
                            return res.json({ output: 'VNC baslatilamadi: ' + vncErr.message, isError: true });
                        }

                        const wsProc = exec(startWs, { timeout: 5000 }, (wsErr) => {});
                        activeSessions[sessionIdVal] = {
                            display: displayNum,
                            vncPort: vncPort,
                            wsPort: wsPort,
                            baseName: baseName,
                            appPid: null,
                            vncPid: null,
                            wsPid: wsProc.pid,
                            xvfbPid: startXvfbProc.pid
                        };

                        setTimeout(() => {
                            const appCmd = `'${outputFile}'`;
                            const appProc = exec(appCmd, {
                                timeout: GUI_TIMEOUT_MS,
                                maxBuffer: 1024 * 512,
                                env: { ...cleanEnv, DISPLAY: `:${displayNum}` }
                            }, (runErr, runStdout, runStderr) => {
                            });

                            if (activeSessions[sessionIdVal]) {
                                activeSessions[sessionIdVal].appPid = appProc.pid;
                            }

                            const vncLogPath = `/tmp/x11vnc_${uid}.log`;
                            let vncPid = null;
                            try {
                                const vncLog = fs.readFileSync(vncLogPath, 'utf8');
                                const pidMatch = vncLog.match(/started with pid (\d+)/);
                                if (pidMatch) vncPid = parseInt(pidMatch[1]);
                            } catch (_) {}
                            if (activeSessions[sessionIdVal]) {
                                activeSessions[sessionIdVal].vncPid = vncPid;
                            }

                            const protocol = req.protocol;
                            const host = req.hostname;
                            const vncUrl = `${protocol}://${host}:${wsPort}/vnc.html?autoconnect=true&resize=scale&reconnect=true`;

                            res.json({
                                output: 'GUI baslatildi! Asagidaki alandan etkilesime gecin.',
                                isError: false,
                                screenshot: null,
                                vncUrl: vncUrl,
                                sessionId: sessionIdVal,
                                interactive: true
                            });
                        }, 1000);
                    });
                }, 500);
            }
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} uzerinde calisiyor`));
