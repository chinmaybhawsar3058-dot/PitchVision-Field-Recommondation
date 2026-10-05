const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const ROOT_DIR = __dirname;

// Serve the compiled APK if available
function handleApkDownload(res) {
  const apkPaths = [
    path.join(ROOT_DIR, '.build-outputs', 'app-debug.apk'),
    path.join(ROOT_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
  ];

  let foundPath = null;
  for (const p of apkPaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (foundPath) {
    const stat = fs.statSync(foundPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="PitchVision-debug.apk"',
      'Content-Length': stat.size,
    });
    fs.createReadStream(foundPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'APK build not found' }));
  }
}

// Return the text content of any project source file for the live code viewer
function handleFileApi(reqUrl, res) {
  const parsed = url.parse(reqUrl, true);
  const requestedFile = parsed.query.file;

  if (!requestedFile) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing file parameter' }));
    return;
  }

  // Prevent directory traversal
  const safeFile = path.normalize(requestedFile).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(ROOT_DIR, safeFile);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const content = fs.readFileSync(fullPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(content);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File not found' }));
  }
}

// Main HTML page containing the Android Simulator, Code Inspector, and Microproject Documentation
function getHtmlPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PitchVision – Cricket Field Positioning Recommendation</title>
  <meta name="description" content="Android application (Java + XML) for cricket fielding recommendations based on fielder ability, bowler style, and batsman profile.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
    .turf-pattern {
      background-color: #1a4d2e;
      background-image: radial-gradient(#22683e 20%, transparent 20%), radial-gradient(#22683e 20%, transparent 20%);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Top Navigation Bar -->
  <header class="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
        <i class="fa-solid fa-baseball text-white text-lg"></i>
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <h1 class="font-bold text-lg text-white leading-tight">PitchVision</h1>
          <span class="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Android Java + XML</span>
        </div>
        <p class="text-xs text-slate-400 hidden sm:block">Cricket Field Positioning Recommendation System • Mobile Application Development Microproject</p>
      </div>
    </div>

    <!-- Mode Selector & Action Buttons -->
    <div class="flex items-center space-x-2 sm:space-x-3">
      <div class="bg-slate-800 p-1 rounded-xl flex space-x-1 border border-slate-700/60 text-xs font-medium">
        <button id="tabSimBtn" onclick="switchMainTab('simulator')" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow transition-all flex items-center space-x-1.5">
          <i class="fa-solid fa-mobile-screen"></i>
          <span>Live App Emulator</span>
        </button>
        <button id="tabCodeBtn" onclick="switchMainTab('code')" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center space-x-1.5">
          <i class="fa-solid fa-code"></i>
          <span>Android Studio Code (Java/XML)</span>
        </button>
        <button id="tabDocBtn" onclick="switchMainTab('docs')" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center space-x-1.5">
          <i class="fa-solid fa-book-open"></i>
          <span>Project Report & Viva Q&A</span>
        </button>
      </div>

      <a href="/api/download/apk" download class="hidden md:inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition">
        <i class="fa-solid fa-download"></i>
        <span>Download APK (27MB)</span>
      </a>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

    <!-- ==================== VIEW 1: LIVE APP SIMULATOR ==================== -->
    <div id="viewSimulator" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left: Mobile Device Mockup Frame -->
      <div class="lg:col-span-6 flex justify-center">
        <div class="w-full max-w-[380px] bg-slate-900 p-3.5 rounded-[46px] shadow-2xl border-[4px] border-slate-800 ring-1 ring-slate-700/50 relative">
          
          <!-- Phone Speaker Notch -->
          <div class="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
            <div class="w-10 h-1 bg-slate-800 rounded-full"></div>
            <div class="w-2.5 h-2.5 bg-slate-900 rounded-full ml-2 border border-slate-800"></div>
          </div>

          <!-- Phone Inner Screen Container -->
          <div class="bg-[#F4F7F5] rounded-[36px] overflow-hidden flex flex-col h-[740px] text-slate-800 relative select-none">
            
            <!-- Android System Status Bar -->
            <div class="bg-[#083820] text-white px-6 pt-3 pb-1 flex justify-between items-center text-[11px] font-medium z-20">
              <span id="statusBarTime">10:30</span>
              <div class="flex items-center space-x-1.5">
                <i class="fa-solid fa-signal text-[10px]"></i>
                <i class="fa-solid fa-wifi text-[10px]"></i>
                <i class="fa-solid fa-battery-full text-[10px]"></i>
              </div>
            </div>

            <!-- Screen Viewport Wrapper -->
            <div class="flex-1 overflow-y-auto relative" id="mobileViewport">

              <!-- ================= SCREEN 1: LOGIN ================= -->
              <div id="screenLogin" class="min-h-full flex flex-col justify-between">
                <div>
                  <!-- Header -->
                  <div class="bg-gradient-to-br from-[#083820] via-[#0E5A35] to-[#1D8752] p-6 text-center text-white pb-8">
                    <div class="w-16 h-16 mx-auto rounded-full bg-emerald-700/60 p-2.5 border-2 border-emerald-400/40 shadow-inner flex items-center justify-center">
                      <i class="fa-solid fa-baseball text-2xl text-amber-300"></i>
                    </div>
                    <h2 class="text-2xl font-black mt-2 tracking-tight">PitchVision</h2>
                    <p class="text-xs text-emerald-100/80">Cricket Field Positioning Recommendation</p>
                  </div>

                  <!-- Login Card Form -->
                  <div class="p-5 -mt-4 mx-4 bg-white rounded-2xl shadow-lg border border-slate-200/80">
                    <h3 class="font-bold text-lg text-slate-800">Welcome Back</h3>
                    <p class="text-xs text-slate-500 mb-4">Sign in to optimize your cricket fielding strategy</p>

                    <div class="space-y-3.5">
                      <div>
                        <label class="text-xs font-bold text-slate-700 block mb-1">Email</label>
                        <div class="relative">
                          <i class="fa-regular fa-envelope absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                          <input type="email" id="loginEmail" value="coach@pitchvision.com" class="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="Email address">
                        </div>
                      </div>

                      <div>
                        <label class="text-xs font-bold text-slate-700 block mb-1">Password</label>
                        <div class="relative">
                          <i class="fa-solid fa-lock absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                          <input type="password" id="loginPassword" value="cricket123" class="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="Password">
                        </div>
                      </div>

                      <button onclick="handleLoginSubmit()" class="w-full py-2.5 bg-gradient-to-r from-[#0E5A35] to-[#1D8752] hover:brightness-105 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-md transition">
                        Sign In
                      </button>

                      <button onclick="goToScreen('register')" class="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0E5A35] font-semibold text-sm rounded-xl border border-emerald-200 transition">
                        Register
                      </button>

                      <div class="pt-2 border-t border-slate-100 text-center">
                        <button onclick="fillDemoCredentials()" class="text-[11px] text-emerald-700 hover:underline font-medium">
                          ⚡ Auto-Fill Demo Credentials (coach@pitchvision.com)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-4 text-center text-[10px] text-slate-400">
                  Mobile App Dev Microproject • Android Java + XML
                </div>
              </div>

              <!-- ================= SCREEN 2: REGISTER ================= -->
              <div id="screenRegister" class="min-h-full flex flex-col justify-between hidden">
                <div>
                  <div class="bg-gradient-to-br from-[#083820] to-[#1D8752] p-5 text-white">
                    <button onclick="goToScreen('login')" class="text-white hover:text-emerald-200 text-sm flex items-center space-x-1 mb-2">
                      <i class="fa-solid fa-arrow-left"></i>
                      <span>Back to Sign In</span>
                    </button>
                    <h2 class="text-xl font-black">Create Account</h2>
                    <p class="text-xs text-emerald-100/80">Join PitchVision to customize fielding setups</p>
                  </div>

                  <div class="p-5 -mt-3 mx-4 bg-white rounded-2xl shadow-lg border border-slate-200/80 space-y-3">
                    <div>
                      <label class="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                      <input type="text" id="regName" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Coach Name">
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-700 block mb-1">Email</label>
                      <input type="email" id="regEmail" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Email address">
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-700 block mb-1">Password</label>
                      <input type="password" id="regPass" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="At least 6 characters">
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
                      <input type="password" id="regConfirmPass" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Re-type password">
                    </div>

                    <button onclick="handleRegisterSubmit()" class="w-full py-2.5 bg-gradient-to-r from-[#0E5A35] to-[#1D8752] text-white font-semibold text-sm rounded-xl shadow-md">
                      Register
                    </button>
                    <button onclick="goToScreen('login')" class="w-full py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl">
                      Already have an account? Sign In
                    </button>
                  </div>
                </div>
              </div>

              <!-- ================= SCREEN 3: HOME ================= -->
              <div id="screenHome" class="min-h-full flex flex-col justify-between hidden">
                <div class="pb-6">
                  <!-- Header -->
                  <div class="bg-gradient-to-br from-[#083820] to-[#1D8752] p-5 text-white flex justify-between items-center">
                    <div>
                      <div class="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold" id="homeUserGreeting">Welcome, Coach Sharma</div>
                      <h2 class="text-xl font-black">PitchVision Setup</h2>
                    </div>
                    <button onclick="handleLogout()" title="Logout" class="w-8 h-8 rounded-full bg-emerald-800/80 flex items-center justify-center text-white hover:bg-emerald-700">
                      <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                    </button>
                  </div>

                  <!-- Form Card -->
                  <div class="p-4 mx-3 -mt-2 bg-white rounded-2xl shadow border border-slate-200 space-y-4">
                    
                    <!-- Section 1: Fielder -->
                    <div>
                      <div class="flex items-center space-x-1.5 text-[#0E5A35] font-bold text-xs mb-2">
                        <i class="fa-solid fa-person-running"></i>
                        <span>1. Fielder Profile</span>
                      </div>

                      <label class="text-xs font-bold text-slate-700 block mb-1">Fielder Name</label>
                      <input type="text" id="simFielderName" value="Virat Kohli" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-600" placeholder="e.g. Virat Kohli">

                      <!-- Presets -->
                      <div class="mt-2">
                        <span class="text-[10px] text-slate-400 font-semibold block mb-1">Quick Presets:</span>
                        <div class="flex flex-wrap gap-1.5">
                          <button onclick="applyPreset('Virat Kohli', 'Fast Runner', 'Fast Bowler', 'Right Hand', 'Aggressive')" class="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-100">⚡ V. Kohli</button>
                          <button onclick="applyPreset('Ravindra Jadeja', 'Good Thrower', 'Spinner', 'Right Hand', 'Aggressive')" class="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-100">🎯 R. Jadeja</button>
                          <button onclick="applyPreset('Ben Stokes', 'All Round Fielder', 'Fast Bowler', 'Left Hand', 'Aggressive')" class="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-100">🛡️ B. Stokes</button>
                          <button onclick="applyPreset('Steve Smith', 'Good Catcher', 'Fast Bowler', 'Right Hand', 'Defensive')" class="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-100">🧤 S. Smith</button>
                        </div>
                      </div>

                      <label class="text-xs font-bold text-slate-700 block mt-3 mb-1">Fielder Ability</label>
                      <select id="simAbility" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none">
                        <option value="Fast Runner" selected>Fast Runner</option>
                        <option value="Good Catcher">Good Catcher</option>
                        <option value="Strong Arm">Strong Arm</option>
                        <option value="Good Thrower">Good Thrower</option>
                        <option value="All Round Fielder">All Round Fielder</option>
                      </select>
                    </div>

                    <div class="border-t border-slate-100"></div>

                    <!-- Section 2: Match Context -->
                    <div>
                      <div class="flex items-center space-x-1.5 text-[#0E5A35] font-bold text-xs mb-2">
                        <i class="fa-solid fa-baseball"></i>
                        <span>2. Match Context</span>
                      </div>

                      <div class="space-y-2.5">
                        <div>
                          <label class="text-xs font-bold text-slate-700 block mb-1">Bowler Type</label>
                          <select id="simBowler" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none">
                            <option value="Fast Bowler" selected>Fast Bowler</option>
                            <option value="Medium Pacer">Medium Pacer</option>
                            <option value="Spinner">Spinner</option>
                          </select>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                          <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">Batsman Hand</label>
                            <select id="simHand" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none">
                              <option value="Right Hand" selected>Right Hand</option>
                              <option value="Left Hand">Left Hand</option>
                            </select>
                          </div>
                          <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">Batsman Style</label>
                            <select id="simStyle" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none">
                              <option value="Aggressive" selected>Aggressive</option>
                              <option value="Defensive">Defensive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button onclick="calculateAndShowRecommendation()" class="w-full py-3 bg-gradient-to-r from-[#0E5A35] to-[#1D8752] hover:brightness-105 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg transition">
                      Recommend Position
                    </button>

                    <button onclick="resetHomeForm()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <!-- ================= SCREEN 4: FIELD RECOMMENDATION ================= -->
              <div id="screenField" class="min-h-full flex flex-col justify-between hidden">
                <div class="pb-6">
                  <!-- Header -->
                  <div class="bg-gradient-to-br from-[#083820] to-[#1D8752] p-4 text-white flex items-center space-x-3">
                    <button onclick="goToScreen('home')" class="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white hover:bg-emerald-700">
                      <i class="fa-solid fa-arrow-left text-xs"></i>
                    </button>
                    <div>
                      <h2 class="text-lg font-black leading-tight">Field Positioning</h2>
                      <p class="text-[11px] text-emerald-100/80" id="fieldSubtitle">Strategic ground layout</p>
                    </div>
                  </div>

                  <!-- Cricket Ground Canvas Card -->
                  <div class="p-3 mx-3 -mt-2 bg-[#121E17] rounded-2xl shadow-lg border border-slate-800">
                    <div class="flex justify-between items-center text-[10px] text-slate-300 mb-1.5 px-1">
                      <span id="fieldGroundMatchLabel" class="bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">Right Hand • Fast Bowler</span>
                      <span class="text-amber-400 font-bold">📍 Position Pinned</span>
                    </div>

                    <!-- 2D Canvas matching CricketFieldView.java -->
                    <div class="relative w-full aspect-square rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                      <canvas id="cricketCanvas" width="320" height="320" class="w-full h-full"></canvas>
                    </div>

                    <div class="text-center text-[10px] text-slate-400 mt-2">
                      🟡 Fielder Marker • ⚪ 30-Yard Circle • 🏏 Pitch & Wickets
                    </div>
                  </div>

                  <!-- Recommendation Details Card -->
                  <div class="p-4 mx-3 mt-3 bg-white rounded-2xl shadow border border-slate-200 space-y-3">
                    <div>
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended Position</span>
                      <h3 class="text-xl font-black text-[#0E5A35]" id="recPosName">Deep Extra Cover</h3>
                      
                      <div class="flex gap-1.5 mt-1">
                        <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full" id="recZone">Boundary Sweeper</span>
                        <span class="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full" id="recSide">Off Side</span>
                      </div>
                    </div>

                    <!-- Match Summary Table -->
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div class="flex justify-between"><span class="text-slate-500">Fielder:</span><span class="font-bold text-slate-800" id="recFielder">Virat Kohli</span></div>
                      <div class="flex justify-between"><span class="text-slate-500">Skill:</span><span class="font-semibold text-slate-700" id="recAbility">Fast Runner</span></div>
                      <div class="flex justify-between"><span class="text-slate-500">Match Up:</span><span class="font-semibold text-slate-700" id="recMatchUp">Fast Bowler vs RHB (Aggressive)</span></div>
                    </div>

                    <div>
                      <h4 class="text-xs font-bold text-[#0E5A35] mb-1">Tactical Analysis & Rationale:</h4>
                      <p class="text-xs text-slate-600 leading-relaxed" id="recReasoning">
                        Fast runners are best deployed in the deep cover and sweeper boundary region against aggressive pace.
                      </p>
                    </div>

                    <button onclick="goToScreen('home')" class="w-full py-2.5 bg-gradient-to-r from-[#0E5A35] to-[#1D8752] text-white font-semibold text-xs rounded-xl shadow">
                      Configure Another Fielder
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Android Navigation Bar (Back, Home, Recents) -->
            <div class="bg-[#083820] text-slate-400 py-1.5 px-10 flex justify-around items-center text-xs border-t border-emerald-950/40">
              <button onclick="androidNavBack()" class="hover:text-white p-1"><i class="fa-solid fa-chevron-left text-[11px]"></i></button>
              <button onclick="goToScreen('home')" class="hover:text-white p-1"><i class="fa-regular fa-circle text-[11px]"></i></button>
              <button onclick="goToScreen('login')" class="hover:text-white p-1"><i class="fa-regular fa-square text-[11px]"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Live Tactical Inspector & Quick Controls -->
      <div class="lg:col-span-6 space-y-6">
        
        <!-- Live Positioning Intelligence Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 class="font-bold text-lg text-white">Live Ground Analysis</h3>
              <p class="text-xs text-slate-400">Dynamic calculations matching <span class="text-emerald-400 font-mono">PositionEngine.java</span></p>
            </div>
            <span class="px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">Realtime 2D Canvas</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Boundary Arc</span>
              <span class="text-base font-bold text-emerald-400" id="dashArc">75m Cover</span>
            </div>
            <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Handedness</span>
              <span class="text-base font-bold text-amber-400" id="dashHand">Right Hand</span>
            </div>
            <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Catch Rate</span>
              <span class="text-base font-bold text-blue-400" id="dashCatch">85%</span>
            </div>
            <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Run Saving</span>
              <span class="text-base font-bold text-purple-400" id="dashRunSave">97%</span>
            </div>
          </div>

          <div class="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
            <div class="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-2">
              <i class="fa-solid fa-compass-drafting"></i>
              <span>Left-Handed Batsman Coordinate Mirroring</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              When a Left-Handed batsman is selected, <code class="text-amber-300">PositionEngine.java</code> automatically flips the X-axis ratio (<code class="text-emerald-300">xRatio = -xRatio</code>) and mirrors the Off-Side / Leg-Side geometry on the 2D canvas view, keeping fielding positions mathematically and tactically accurate according to international cricket laws.
            </p>
          </div>
        </div>

        <!-- Android Microproject Highlights -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 class="font-bold text-base text-white flex items-center space-x-2">
            <i class="fa-brands fa-android text-emerald-400"></i>
            <span>College Microproject Architecture Details</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span class="text-slate-400 font-semibold block mb-0.5">Frontend UI</span>
              <span class="text-white font-medium">Standard Android XML (CardView, ScrollView, TableLayout, Spinners)</span>
            </div>
            <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span class="text-slate-400 font-semibold block mb-0.5">Backend Logic</span>
              <span class="text-white font-medium">Pure Java 11 (PositionEngine, UserSessionManager)</span>
            </div>
            <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span class="text-slate-400 font-semibold block mb-0.5">Graphics Engine</span>
              <span class="text-white font-medium">Custom 2D Canvas (CricketFieldView.java with Paint & RectF)</span>
            </div>
            <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span class="text-slate-400 font-semibold block mb-0.5">Data Storage</span>
              <span class="text-white font-medium">SharedPreferences (Persistent user auth & demo account)</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-slate-400">Build Status: <span class="text-emerald-400 font-semibold">assembleDebug Passed</span> (Gradle 9.3.1)</span>
            <a href="/api/download/apk" class="text-xs text-amber-400 hover:text-amber-300 font-semibold underline">Download APK</a>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== VIEW 2: ANDROID STUDIO CODE INSPECTOR ==================== -->
    <div id="viewCode" class="hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- File Tree Sidebar -->
        <div class="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 class="font-bold text-sm text-white">Project Files (Java + XML)</h3>
            <span class="text-[10px] text-emerald-400 font-mono">1-Click Inspect</span>
          </div>

          <div class="space-y-1 text-xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase px-2 py-1">Manifest & Gradle</div>
            <button onclick="loadFile('app/src/main/AndroidManifest.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-file-code text-amber-400"></i>
              <span class="truncate">AndroidManifest.xml</span>
            </button>
            <button onclick="loadFile('app/build.gradle.kts')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-gears text-purple-400"></i>
              <span class="truncate">app/build.gradle.kts</span>
            </button>

            <div class="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 pt-3">Java Source Classes</div>
            <button onclick="loadFile('app/src/main/java/com/example/CricketFieldView.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate font-semibold text-emerald-300">CricketFieldView.java (Canvas)</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/PositionEngine.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">PositionEngine.java (Algorithm)</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/LoginActivity.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">LoginActivity.java</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/RegisterActivity.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">RegisterActivity.java</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/HomeActivity.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">HomeActivity.java</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/FieldActivity.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">FieldActivity.java</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/FieldPosition.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">FieldPosition.java</span>
            </button>
            <button onclick="loadFile('app/src/main/java/com/example/UserSessionManager.java')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-brands fa-java text-orange-400"></i>
              <span class="truncate">UserSessionManager.java</span>
            </button>

            <div class="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 pt-3">XML Layouts & Values</div>
            <button onclick="loadFile('app/src/main/res/layout/activity_field.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-code text-blue-400"></i>
              <span class="truncate">activity_field.xml</span>
            </button>
            <button onclick="loadFile('app/src/main/res/layout/activity_home.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-code text-blue-400"></i>
              <span class="truncate">activity_home.xml</span>
            </button>
            <button onclick="loadFile('app/src/main/res/layout/activity_login.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-code text-blue-400"></i>
              <span class="truncate">activity_login.xml</span>
            </button>
            <button onclick="loadFile('app/src/main/res/layout/activity_register.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-code text-blue-400"></i>
              <span class="truncate">activity_register.xml</span>
            </button>
            <button onclick="loadFile('app/src/main/res/values/strings.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-font text-emerald-400"></i>
              <span class="truncate">strings.xml</span>
            </button>
            <button onclick="loadFile('app/src/main/res/values/colors.xml')" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2">
              <i class="fa-solid fa-palette text-pink-400"></i>
              <span class="truncate">colors.xml</span>
            </button>
          </div>
        </div>

        <!-- Code Viewer Panel -->
        <div class="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[750px]">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div class="flex items-center space-x-2">
              <i class="fa-solid fa-file-code text-emerald-400"></i>
              <span id="activeFileName" class="font-mono text-sm text-white font-semibold">CricketFieldView.java</span>
            </div>
            <button onclick="copyActiveCode()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700 transition flex items-center space-x-1.5">
              <i class="fa-regular fa-copy"></i>
              <span id="copyBtnLabel">Copy Code</span>
            </button>
          </div>

          <div class="flex-1 overflow-auto rounded-2xl bg-slate-950 p-4 border border-slate-800/80">
            <pre><code id="codeDisplay" class="text-xs text-emerald-300/90 leading-relaxed block">Loading source file...</code></pre>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== VIEW 3: PROJECT REPORT & VIVA GUIDE ==================== -->
    <div id="viewDocs" class="hidden space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        <!-- Header -->
        <div class="border-b border-slate-800 pb-5">
          <div class="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-2">
            Mobile Application Development Microproject
          </div>
          <h2 class="text-2xl font-bold text-white">Project Report: PitchVision – Cricket Field Positioning Recommendation</h2>
          <p class="text-sm text-slate-400 mt-1">Platform: Android Studio | Language: Java 11 | Layouts: Android XML | Minimum SDK: 24 (Android 7.0+)</p>
        </div>

        <!-- Section 1: Abstract -->
        <div class="space-y-2">
          <h3 class="text-lg font-bold text-white flex items-center space-x-2">
            <i class="fa-solid fa-circle-info text-emerald-400 text-sm"></i>
            <span>1. Abstract & Problem Statement</span>
          </h3>
          <p class="text-sm text-slate-300 leading-relaxed">
            In modern cricket, field positioning is a game-changing tactical parameter that directly dictates run flow and wicket opportunities. Amateur captains and college teams often struggle to deploy individual fielders according to their specific athletic attributes (e.g. throwing range, catching reflexes, or foot speed) combined with batsman and bowler dynamics. <strong>PitchVision</strong> bridges this gap by calculating mathematically sound and tactically tested fielding spots, visually rendering them on a proportional 2D cricket ground canvas.
          </p>
        </div>

        <!-- Section 2: Decision Matrix Table -->
        <div class="space-y-3">
          <h3 class="text-lg font-bold text-white flex items-center space-x-2">
            <i class="fa-solid fa-table-cells text-emerald-400 text-sm"></i>
            <span>2. Tactical Positioning Algorithm Matrix</span>
          </h3>
          <div class="overflow-x-auto rounded-2xl border border-slate-800">
            <table class="w-full text-xs text-left text-slate-300">
              <thead class="bg-slate-800 text-slate-200 uppercase font-semibold">
                <tr>
                  <th class="p-3">Fielder Ability</th>
                  <th class="p-3">Bowler Type</th>
                  <th class="p-3">Batsman Style</th>
                  <th class="p-3">Recommended Position</th>
                  <th class="p-3">Tactical Justification</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 bg-slate-950/60">
                <tr>
                  <td class="p-3 font-semibold text-emerald-300">Good Catcher</td>
                  <td class="p-3">Fast Bowler</td>
                  <td class="p-3">Aggressive</td>
                  <td class="p-3 font-bold text-white">First Slip</td>
                  <td class="p-3 text-slate-400">Captures outside edges from hard-slashed drives at 140+ km/h.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-emerald-300">Good Catcher</td>
                  <td class="p-3">Spinner</td>
                  <td class="p-3">Defensive</td>
                  <td class="p-3 font-bold text-white">Forward Short Leg</td>
                  <td class="p-3 text-slate-400">Attacks inside edges, glove glances, and bat-pad pops off forward prods.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-emerald-300">Fast Runner</td>
                  <td class="p-3">Fast Bowler</td>
                  <td class="p-3">Aggressive</td>
                  <td class="p-3 font-bold text-white">Deep Extra Cover</td>
                  <td class="p-3 text-slate-400">Sprints fence to cut off boundary lofted cover drives and turn 4s into 1s.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-emerald-300">Strong Arm</td>
                  <td class="p-3">Fast Bowler</td>
                  <td class="p-3">Aggressive</td>
                  <td class="p-3 font-bold text-white">Third Man</td>
                  <td class="p-3 text-slate-400">Delivers flat 70m bullet throw directly over stumps to wicket-keeper.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-emerald-300">Good Thrower</td>
                  <td class="p-3">Any</td>
                  <td class="p-3">Aggressive</td>
                  <td class="p-3 font-bold text-white">Backward Point</td>
                  <td class="p-3 text-slate-400">Deters quick drop-and-run singles with direct hit run-out threat.</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-emerald-300">All Rounder</td>
                  <td class="p-3">Fast Bowler</td>
                  <td class="p-3">Aggressive</td>
                  <td class="p-3 font-bold text-white">Extra Cover</td>
                  <td class="p-3 text-slate-400">Demands diving stops, catching reflexes, and rapid pick-and-throws.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Viva Questions & Answers -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-white flex items-center space-x-2">
            <i class="fa-solid fa-graduation-cap text-emerald-400 text-sm"></i>
            <span>3. Frequently Asked Viva Questions (with Answers)</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span class="font-bold text-amber-400">Q1: How does the custom ground view draw shapes without external image files?</span>
              <p class="text-slate-300 leading-relaxed">
                In <code class="text-emerald-300">CricketFieldView.java</code>, we extend Android's <code class="text-emerald-300">View</code> and override <code class="text-emerald-300">onDraw(Canvas canvas)</code>. We use Android's native 2D graphics pipeline: <code class="text-emerald-300">canvas.drawOval()</code> for boundary and 30-yard circle, <code class="text-emerald-300">canvas.drawRoundRect()</code> for the pitch, and <code class="text-emerald-300">Paint</code> objects for anti-aliasing, dashing, and colors.
              </p>
            </div>

            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span class="font-bold text-amber-400">Q2: How does the app handle Left-Handed vs Right-Handed batsmen?</span>
              <p class="text-slate-300 leading-relaxed">
                In cricket, the Off-side and Leg-side are opposite for a left-handed batsman. <code class="text-emerald-300">PositionEngine.java</code> checks if <code class="text-emerald-300">isLeftHand</code> is true, and inverts the horizontal ratio (<code class="text-emerald-300">xRatio = -xRatio</code>), dynamically shifting coordinates on the Canvas while updating the tactical badge.
              </p>
            </div>

            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span class="font-bold text-amber-400">Q3: How are user sessions maintained?</span>
              <p class="text-slate-300 leading-relaxed">
                Using <code class="text-emerald-300">SharedPreferences</code> in <code class="text-emerald-300">UserSessionManager.java</code>. When a user registers or logs in, their email and name are saved persistently. The app also seeds default coach credentials (<code class="text-emerald-300">coach@pitchvision.com / cricket123</code>) for zero-setup demo presentation.
              </p>
            </div>

            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span class="font-bold text-amber-400">Q4: Why use Java and XML instead of Jetpack Compose for this project?</span>
              <p class="text-slate-300 leading-relaxed">
                Java + XML is the foundational Android architecture taught in university Mobile Application Development curriculums. It demonstrates core mastery of the Android activity lifecycle, intents, XML layouts, and custom 2D Canvas views.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </main>

  <!-- Simulator & Interactive Logic Script -->
  <script>
    // State tracking for the mobile simulator
    let currentScreen = 'login';
    let currentUser = { name: 'Coach Sharma', email: 'coach@pitchvision.com' };
    let currentRecommendation = null;

    // Tactical Positioning Engine in JS mirroring PositionEngine.java
    function calculatePosition(name, ability, bowler, hand, style) {
      const isLeft = (hand === 'Left Hand');
      const isAgg = (style === 'Aggressive');
      let posName = 'Deep Extra Cover';
      let zone = 'Boundary Sweeper';
      let side = 'Off Side';
      let x = -0.74, y = 0.15;
      let reason = '';
      let catchChance = 80, runSave = 95;

      if (ability === 'Good Catcher') {
        if (bowler === 'Spinner') {
          if (isAgg) {
            posName = 'Deep Mid-Wicket'; zone = 'Boundary Catching'; side = 'Leg Side'; x = 0.65; y = 0.35;
            reason = name + " has superior catching reflexes. Against aggressive spin, lofted slog-sweeps frequently carry to deep mid-wicket for crucial wicket chances.";
            catchChance = 94; runSave = 78;
          } else {
            posName = 'Forward Short Leg'; zone = 'Close Infield Cordon'; side = 'Leg Side'; x = 0.16; y = -0.28;
            reason = name + " stationed at forward short leg capitalizes on glove deflections, inside-edges, and bat-pad pop-ups off defensive prods.";
            catchChance = 96; runSave = 40;
          }
        } else if (bowler === 'Fast Bowler') {
          if (isAgg) {
            posName = 'First Slip'; zone = 'Catching Slip Cordon'; side = 'Off Side'; x = -0.15; y = -0.60;
            reason = name + " provides safe hands in the slip cordon. Aggressive batsmen flashing hard outside off against express pace offer high-speed, regulation catches.";
            catchChance = 98; runSave = 60;
          } else {
            posName = 'Gully'; zone = 'Catching Slip Cordon'; side = 'Off Side'; x = -0.42; y = -0.38;
            reason = name + " positioned at gully attacks thick squirted edges and defensive push-drives through the backward point and slip gap.";
            catchChance = 92; runSave = 70;
          }
        } else {
          posName = isAgg ? 'First Slip' : 'Backward Point';
          zone = isAgg ? 'Catching Slip Cordon' : 'Infield Ring';
          side = 'Off Side';
          x = isAgg ? -0.18 : -0.46; y = isAgg ? -0.56 : -0.25;
          reason = name + "'s catching ability at " + posName + " chokes scoring against medium pace swing and intercepts airborne cuts.";
          catchChance = 90; runSave = 82;
        }
      } else if (ability === 'Fast Runner') {
        if (bowler === 'Spinner') {
          if (isAgg) {
            posName = 'Deep Mid-Wicket'; zone = 'Deep Boundary Sweeper'; side = 'Leg Side'; x = 0.72; y = 0.40;
            reason = name + "'s running speed covers vast ground between deep mid-wicket and long-on, cutting off 4s against aggressive spin assault.";
            catchChance = 82; runSave = 95;
          } else {
            posName = 'Cover Point'; zone = '30-Yard Infield Ring'; side = 'Off Side'; x = -0.50; y = -0.05;
            reason = name + " rapidly charges in from cover point, smothering soft push singles and putting immense psychological pressure on the batsman.";
            catchChance = 75; runSave = 92;
          }
        } else {
          if (isAgg) {
            posName = 'Deep Extra Cover'; zone = 'Deep Boundary Sweeper'; side = 'Off Side'; x = -0.74; y = 0.15;
            reason = name + "'s pace makes them the ideal sweeper at deep extra cover, sprinting along the fence to cut off thunderous lofted cover drives.";
            catchChance = 80; runSave = 97;
          } else {
            posName = 'Sweeper Cover'; zone = 'Deep Boundary Sweeper'; side = 'Off Side'; x = -0.76; y = -0.15;
            reason = name + " patrols the open off-side deep boundary, choking singles and keeping the fielding captain in complete control.";
            catchChance = 72; runSave = 93;
          }
        }
      } else if (ability === 'Strong Arm') {
        if (bowler === 'Fast Bowler') {
          if (isAgg) {
            posName = 'Third Man'; zone = 'Boundary Patrol'; side = 'Off Side'; x = -0.60; y = -0.72;
            reason = name + "'s powerful arm is vital at third man. A flat 70m bullet throw directly over the bails prevents batters stealing a second run.";
            catchChance = 76; runSave = 98;
          } else {
            posName = 'Deep Fine Leg'; zone = 'Boundary Patrol'; side = 'Leg Side'; x = 0.55; y = -0.74;
            reason = name + " utilizes their throwing arm at deep fine leg to launch direct rocket throws over the bails on defensive glances.";
            catchChance = 74; runSave = 96;
          }
        } else if (bowler === 'Spinner') {
          posName = 'Long On'; zone = 'Boundary Patrol'; side = 'Leg Side'; x = 0.38; y = 0.78;
          reason = name + " delivers flat rocket throws directly to the bowler's stumps, preventing aggressive batters converting singles into twos.";
          catchChance = 84; runSave = 94;
        } else {
          posName = 'Deep Square Leg'; zone = 'Boundary Patrol'; side = 'Leg Side'; x = 0.74; y = -0.25;
          reason = name + " commands deep square leg. Pull shots and mistimed sweeps are quickly collected and dispatched on the fly back to the keeper.";
          catchChance = 82; runSave = 95;
        }
      } else if (ability === 'Good Thrower') {
        if (isAgg) {
          posName = 'Backward Point'; zone = 'Inner Ring Hotspot'; side = 'Off Side'; x = -0.48; y = -0.28;
          reason = name + " brings lethal throwing accuracy to backward point. Any hesitation on square cuts results in a lightning-fast direct hit run-out.";
          catchChance = 88; runSave = 96;
        } else {
          posName = (bowler === 'Spinner') ? 'Short Mid-Wicket' : 'Cover Point';
          zone = 'Inner Ring Hotspot';
          side = (bowler === 'Spinner') ? 'Leg Side' : 'Off Side';
          x = (bowler === 'Spinner') ? 0.40 : -0.48;
          y = (bowler === 'Spinner') ? 0.05 : -0.10;
          reason = name + " clamps down on soft defensive taps with pinpoint underarm flicks onto the stumps to produce run-out breakthroughs.";
          catchChance = 86; runSave = 94;
        }
      } else { // All Round Fielder
        if (isAgg) {
          if (bowler === 'Spinner') {
            posName = 'Long Off'; zone = 'V-Zone Boundary Command'; side = 'Off Side'; x = -0.38; y = 0.78;
            reason = name + " is a complete fielder possessing high agility and distance coverage. Long off allows them to intercept straight lofted drives.";
            catchChance = 90; runSave = 92;
          } else {
            posName = 'Extra Cover'; zone = '30-Yard Ring Command'; side = 'Off Side'; x = -0.46; y = 0.12;
            reason = name + " commands extra cover, demanding diving stops, catching reflexes, and rapid pick-and-throw executions in the ring.";
            catchChance = 89; runSave = 96;
          }
        } else {
          posName = 'Mid Wicket'; zone = '30-Yard Ring Anchor'; side = 'Leg Side'; x = 0.44; y = 0.16;
          reason = name + " anchors mid wicket, stopping easy rotations into the on-side against defensive batsmen and maintaining relentless bowling pressure.";
          catchChance = 86; runSave = 90;
        }
      }

      // Mirror X if left-handed batsman
      if (isLeft) {
        x = -x;
        side = (side === 'Off Side') ? 'Off Side (LHB)' : 'Leg Side (LHB)';
      }

      return { posName, zone, side, x, y, reason, catchChance, runSave, name, hand, bowler, ability, style };
    }

    // Canvas drawing implementation mirroring CricketFieldView.java
    function drawCricketField(rec) {
      const canvas = document.getElementById('cricketCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const rx = (w - 24) / 2;
      const ry = (h - 24) / 2;

      // 1. Outer Grass Oval
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1A4D2E';
      ctx.fill();

      // Mowing lawn concentric band
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#22683E';
      ctx.fill();

      // 2. 30-Yard Circle (dashed)
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.52, ry * 0.52, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Boundary Rope
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 4. Central 22-Yard Pitch
      const pw = rx * 0.14;
      const ph = ry * 0.46;
      ctx.fillStyle = '#C8AB83';
      ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);

      // Creases
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const strikerY = cy - ph * 0.35;
      const bowlerY = cy + ph * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - pw / 2 + 2, strikerY);
      ctx.lineTo(cx + pw / 2 - 2, strikerY);
      ctx.moveTo(cx - pw / 2 + 2, bowlerY);
      ctx.lineTo(cx + pw / 2 - 2, bowlerY);
      ctx.stroke();

      // Stumps
      ctx.fillStyle = '#FFE082';
      [-3, 0, 3].forEach(offset => {
        ctx.fillRect(cx + offset - 0.75, cy - ph * 0.42 - 2, 1.5, 4);
        ctx.fillRect(cx + offset - 0.75, cy + ph * 0.42 - 2, 1.5, 4);
      });

      // Direction Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BATSMAN 🏏', cx, cy - ph * 0.48);
      ctx.fillText('BOWLER ⬆️', cx, cy + ph * 0.56);

      // Dynamic Off/Leg labels
      const isLeft = rec.hand === 'Left Hand';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillText(isLeft ? 'LEG SIDE' : 'OFF SIDE', cx - rx * 0.65, cy);
      ctx.fillText(isLeft ? 'OFF SIDE' : 'LEG SIDE', cx + rx * 0.65, cy);

      // Contextual Default Fielders (gray dots)
      const defaultFielders = [
        [0.0, -0.62], [-0.22, -0.52], [-0.44, -0.22], [-0.38, 0.12],
        [-0.18, 0.42], [0.18, 0.42], [0.38, 0.15], [0.45, -0.22],
        [0.32, -0.65], [-0.55, -0.65]
      ];
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      defaultFielders.forEach(([fx, fy]) => {
        ctx.beginPath();
        ctx.arc(cx + fx * rx * 0.85, cy + fy * ry * 0.85, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pinned Recommended Fielder (Glowing Target Marker)
      const targetX = cx + (rec.x * rx * 0.85);
      const targetY = cy + (rec.y * ry * 0.85);

      // Glowing Halo
      ctx.beginPath();
      ctx.arc(targetX, targetY, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 214, 0, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 214, 0, 0.4)';
      ctx.fill();

      // Center Pin
      ctx.beginPath();
      ctx.arc(targetX, targetY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD600';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Floating Name Badge
      ctx.font = 'bold 9px sans-serif';
      const nameText = '👤 ' + rec.name;
      const posText = rec.posName;
      const textW = Math.max(ctx.measureText(nameText).width, ctx.measureText(posText).width) + 14;
      const badgeH = 26;
      let bx = targetX - textW / 2;
      let by = (targetY > cy) ? targetY - badgeH - 10 : targetY + 10;

      // Ensure inside canvas
      if (bx < 6) bx = 6;
      if (bx + textW > w - 6) bx = w - textW - 6;

      ctx.fillStyle = 'rgba(18, 30, 23, 0.9)';
      ctx.beginPath();
      ctx.roundRect(bx, by, textW, badgeH, 6);
      ctx.fill();
      ctx.strokeStyle = '#FFD600';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(nameText, bx + textW / 2, by + 10);
      ctx.fillStyle = '#FFD600';
      ctx.font = '8px sans-serif';
      ctx.fillText(posText, bx + textW / 2, by + 21);
    }

    function goToScreen(screen) {
      currentScreen = screen;
      ['screenLogin', 'screenRegister', 'screenHome', 'screenField'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });
      const target = 'screen' + screen.charAt(0).toUpperCase() + screen.slice(1);
      document.getElementById(target).classList.remove('hidden');
      document.getElementById('mobileViewport').scrollTop = 0;
    }

    function androidNavBack() {
      if (currentScreen === 'field') goToScreen('home');
      else if (currentScreen === 'register') goToScreen('login');
      else if (currentScreen === 'home') goToScreen('login');
    }

    function fillDemoCredentials() {
      document.getElementById('loginEmail').value = 'coach@pitchvision.com';
      document.getElementById('loginPassword').value = 'cricket123';
    }

    function handleLoginSubmit() {
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value.trim();
      if (!email || !pass) {
        alert('Please enter both email and password');
        return;
      }
      currentUser.email = email;
      currentUser.name = email.includes('coach') ? 'Coach Sharma' : email.split('@')[0];
      document.getElementById('homeUserGreeting').innerText = 'Welcome, ' + currentUser.name;
      goToScreen('home');
    }

    function handleRegisterSubmit() {
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPass').value.trim();
      const confirm = document.getElementById('regConfirmPass').value.trim();
      if (!name || !email || !pass || !confirm) {
        alert('All fields are required');
        return;
      }
      if (pass !== confirm) {
        alert('Passwords do not match');
        return;
      }
      currentUser.name = name;
      currentUser.email = email;
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = pass;
      alert('Registration successful! Please sign in.');
      goToScreen('login');
    }

    function handleLogout() {
      goToScreen('login');
    }

    function applyPreset(name, ability, bowler, hand, style) {
      document.getElementById('simFielderName').value = name;
      document.getElementById('simAbility').value = ability;
      document.getElementById('simBowler').value = bowler;
      document.getElementById('simHand').value = hand;
      document.getElementById('simStyle').value = style;
    }

    function resetHomeForm() {
      document.getElementById('simFielderName').value = '';
      document.getElementById('simAbility').selectedIndex = 0;
      document.getElementById('simBowler').selectedIndex = 0;
      document.getElementById('simHand').selectedIndex = 0;
      document.getElementById('simStyle').selectedIndex = 0;
    }

    function calculateAndShowRecommendation() {
      const name = document.getElementById('simFielderName').value.trim() || 'Fielder';
      const ability = document.getElementById('simAbility').value;
      const bowler = document.getElementById('simBowler').value;
      const hand = document.getElementById('simHand').value;
      const style = document.getElementById('simStyle').value;

      currentRecommendation = calculatePosition(name, ability, bowler, hand, style);

      // Update Screen 4
      document.getElementById('recPosName').innerText = currentRecommendation.posName;
      document.getElementById('recZone').innerText = currentRecommendation.zone;
      document.getElementById('recSide').innerText = currentRecommendation.side;
      document.getElementById('recFielder').innerText = name;
      document.getElementById('recAbility').innerText = ability;
      document.getElementById('recMatchUp').innerText = bowler + ' vs ' + hand + ' (' + style + ')';
      document.getElementById('recReasoning').innerText = currentRecommendation.reason;
      document.getElementById('fieldSubtitle').innerText = name + ' assigned to ' + currentRecommendation.posName;
      document.getElementById('fieldGroundMatchLabel').innerText = hand + ' • ' + bowler;

      // Update right-hand dashboard
      document.getElementById('dashArc').innerText = currentRecommendation.posName;
      document.getElementById('dashHand').innerText = hand;
      document.getElementById('dashCatch').innerText = currentRecommendation.catchChance + '%';
      document.getElementById('dashRunSave').innerText = currentRecommendation.runSave + '%';

      goToScreen('field');
      setTimeout(() => drawCricketField(currentRecommendation), 50);
    }

    function switchMainTab(tab) {
      ['viewSimulator', 'viewCode', 'viewDocs'].forEach(id => document.getElementById(id).classList.add('hidden'));
      ['tabSimBtn', 'tabCodeBtn', 'tabDocBtn'].forEach(id => {
        document.getElementById(id).className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center space-x-1.5';
      });

      if (tab === 'simulator') {
        document.getElementById('viewSimulator').classList.remove('hidden');
        document.getElementById('tabSimBtn').className = 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow transition-all flex items-center space-x-1.5';
        if (currentRecommendation) drawCricketField(currentRecommendation);
      } else if (tab === 'code') {
        document.getElementById('viewCode').classList.remove('hidden');
        document.getElementById('tabCodeBtn').className = 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow transition-all flex items-center space-x-1.5';
        if (!window.loadedInitialCode) {
          loadFile('app/src/main/java/com/example/CricketFieldView.java');
          window.loadedInitialCode = true;
        }
      } else if (tab === 'docs') {
        document.getElementById('viewDocs').classList.remove('hidden');
        document.getElementById('tabDocBtn').className = 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow transition-all flex items-center space-x-1.5';
      }
    }

    function loadFile(filePath) {
      document.getElementById('activeFileName').innerText = filePath;
      document.getElementById('codeDisplay').innerText = 'Fetching ' + filePath + '...';
      fetch('/api/file?file=' + encodeURIComponent(filePath))
        .then(r => r.text())
        .then(text => {
          document.getElementById('codeDisplay').innerText = text;
        })
        .catch(err => {
          document.getElementById('codeDisplay').innerText = 'Error loading file: ' + err.message;
        });
    }

    function copyActiveCode() {
      const code = document.getElementById('codeDisplay').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const lbl = document.getElementById('copyBtnLabel');
        lbl.innerText = 'Copied!';
        setTimeout(() => lbl.innerText = 'Copy Code', 1800);
      });
    }

    // Set time in status bar
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('statusBarTime').innerText = h + ':' + m;
    }
    setInterval(updateClock, 30000);
    updateClock();

    // Initial calculation
    currentRecommendation = calculatePosition('Virat Kohli', 'Fast Runner', 'Fast Bowler', 'Right Hand', 'Aggressive');
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/api/download/apk') {
    handleApkDownload(res);
  } else if (pathname === '/api/file') {
    handleFileApi(req.url, res);
  } else if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', app: 'PitchVision' }));
  } else {
    // Serve the main application UI
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHtmlPage());
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[PitchVision] Server listening on http://0.0.0.0:${PORT}`);
});
