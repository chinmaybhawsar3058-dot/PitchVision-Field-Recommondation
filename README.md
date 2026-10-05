# PitchVision – Cricket Field Positioning Recommendation
**Mobile Application Development Microproject | Android (Java + XML)**

---

## 📌 Project Overview
**PitchVision** is a mobile application developed in **Java** and **Android XML** designed to assist cricket coaches, captains, and players in strategically calculating the optimal fielding position on a cricket ground. 

By analyzing:
1. **Fielder Ability**: Fast Runner, Good Catcher, Strong Arm, Good Thrower, All Round Fielder
2. **Bowler Type**: Fast Bowler, Medium Pacer, Spinner
3. **Batsman Handedness & Style**: Right Hand / Left Hand, Aggressive / Defensive

PitchVision renders an authentic **2D Cricket Field Ground** using a custom Canvas view (`CricketFieldView.java`), pins the assigned fielder's name right on the grass, marks the exact fielding spot, and provides an in-depth tactical explanation.

---

## 📱 App Screens & Features

### 1. Login Screen (`LoginActivity.java` & `activity_login.xml`)
- **Email & Password Fields**: Complete with input validation.
- **Sign In Button**: Verifies credentials stored in `SharedPreferences`.
- **Register Button**: Seamlessly navigates to the registration flow.
- **Auto-Fill Demo Credentials Button**: One-tap fill (`coach@pitchvision.com` / `cricket123`) for effortless viva evaluation.

### 2. Register Screen (`RegisterActivity.java` & `activity_register.xml`)
- **Name, Email, Password, & Confirm Password** input fields.
- Validates field emptiness, email format regex, password length (minimum 6 characters), and password matching.
- Saves account credentials into persistent `SharedPreferences`.
- Navigates back to the Login screen with instant access.

### 3. Home Screen (`HomeActivity.java` & `activity_home.xml`)
- **Fielder Profile**:
  - `EditText` to enter the fielder's name.
  - **Quick Preset Chips**: Fast 1-tap presets for cricket stars (*Virat Kohli - Fast Runner*, *Ravindra Jadeja - Good Thrower*, *Ben Stokes - All Rounder*, *Steve Smith - Good Catcher*).
  - **Fielder Ability Dropdown** (`Spinner`):
    - Fast Runner
    - Good Catcher
    - Strong Arm
    - Good Thrower
    - All Round Fielder
- **Match Context**:
  - **Bowler Type Dropdown** (`Spinner`):
    - Fast Bowler
    - Medium Pacer
    - Spinner
  - **Batsman Handedness** (`Spinner`):
    - Right Hand
    - Left Hand
  - **Batsman Style** (`Spinner`):
    - Aggressive
    - Defensive
- **Recommend Position Button**: Validates inputs and passes parameters via `Intent` to `FieldActivity`.
- **Reset Button**: Clears all inputs.
- **Logout Action**: Clears user session.

### 4. Field Screen (`FieldActivity.java` & `activity_field.xml`)
- **Custom 2D Cricket Ground Canvas** (`CricketFieldView.java`):
  - Lush green boundary turf with grass mowing bands.
  - White boundary rope (representing 70-80m distance).
  - Inner 30-yard fielding circle (dashed white line).
  - Central 22-yard clay pitch with striker crease, bowling crease, and stumps.
  - Striker and Bowler direction indicators.
  - **Dynamic Off-Side & Leg-Side Watermarks**: Automatically mirrors Off-side and Leg-side positions when facing a Left-Handed batsman!
  - Translucent reference dots showing standard 11-player field arrangement.
  - **Recommended Position Marker**: Glowing gold beacon with an interactive floating badge showing the **Fielder's Name** and **Position Name** directly on the grass!
- **Position Recommendation Card**:
  - Prominent Position Badge (e.g. *Deep Extra Cover*, *First Slip*, *Long On*, *Backward Point*).
  - Tactical Zone & Side Badges (e.g. *Boundary Sweeper*, *Slip Cordon*, *Off Side*).
  - Summary Table of Fielder, Ability, Bowler, and Batsman profile.
  - **Tactical Analysis & Rationale**: Explains the strategic physics, catching angles, and boundary-saving reasons behind the placement.
  - "Configure Another Fielder" button for quick iteration.

---

## 🏗️ Project Architecture & File Hierarchy

```
app/
├── src/
│   ├── main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── CricketFieldView.java      (Custom 2D Canvas Graphics View)
│   │   │       ├── FieldActivity.java         (Screen 4: Ground Visualization & Rationale)
│   │   │       ├── FieldPosition.java         (Data model for positioning and tactical metrics)
│   │   │       ├── HomeActivity.java          (Screen 3: Input Parameters & Presets)
│   │   │       ├── LoginActivity.java         (Screen 1: Authentication & Demo Entry)
│   │   │       ├── PositionEngine.java        (Tactical Decision Algorithm & Mirroring Logic)
│   │   │       ├── RegisterActivity.java      (Screen 2: Account Creation & Validation)
│   │   │       └── UserSessionManager.java    (SharedPreferences Session Manager)
│   │   └── res/
│   │       ├── drawable/
│   │       │   ├── bg_badge.xml
│   │       │   ├── bg_badge_gold.xml
│   │       │   ├── bg_button_primary.xml
│   │       │   ├── bg_button_secondary.xml
│   │       │   ├── bg_card_white.xml
│   │       │   ├── bg_gradient_header.xml
│   │       │   ├── bg_input_box.xml
│   │       │   ├── ic_arrow_back.xml
│   │       │   ├── ic_check_circle.xml
│   │       │   ├── ic_cricket_ball.xml
│   │       │   ├── ic_email.xml
│   │       │   ├── ic_fielder.xml
│   │       │   ├── ic_lock.xml
│   │       │   ├── ic_logout.xml
│   │       │   ├── ic_person.xml
│   │       │   ├── ic_pitch_vision_logo.xml
│   │       │   └── ic_stumps.xml
│   │       ├── layout/
│   │       │   ├── activity_field.xml
│   │       │   ├── activity_home.xml
│   │       │   ├── activity_login.xml
│   │       │   ├── activity_register.xml
│   │       │   └── item_spinner.xml
│   │       └── values/
│   │           ├── arrays.xml                 (Spinner data arrays)
│   │           ├── colors.xml                 (Turf green, pitch tan, gold theme colors)
│   │           ├── strings.xml                (All UI labels and descriptions)
│   │           └── themes.xml                 (MaterialComponents light theme)
│   └── test/
│       └── java/com/example/ExampleRobolectricTest.kt
├── build.gradle.kts
```

---

## 🚀 How to Run in Android Studio

1. Open **Android Studio** (Flamingo, Hedgehog, Iguana, Jellyfish, Koala, Ladybug, or newer).
2. Click **Open** and select this project directory.
3. Wait for **Gradle Sync** to finish (it downloads the standard AndroidX and Material libraries).
4. Select an Android Emulator (Pixel 6/7/8 with API 24+) or connect a physical Android phone via USB with USB Debugging enabled.
5. Click the green **Run (▶)** button.
6. The app will launch directly into the **Login Screen**.
   - Tap **"⚡ Auto-Fill Demo Credentials"** -> Tap **Sign In**.
   - Select or type a player name -> select abilities and conditions -> Tap **"Recommend Position"**.
   - View the live 2D cricket ground with the fielder pinned!

---

## 🧠 Recommendation Algorithm Matrix

| Fielder Ability | Bowler Type | Batsman Style | Batsman Hand | Recommended Spot | Strategic Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Good Catcher** | Fast Bowler | Aggressive | RHB / LHB | **First Slip** | Intercepts outside edges from flashed drives at high pace. |
| **Good Catcher** | Fast Bowler | Defensive | RHB / LHB | **Gully** | Catches thick squirted defensive edges behind square. |
| **Good Catcher** | Spinner | Defensive | RHB / LHB | **Forward Short Leg** | Bat-pad pop-ups off forward prods against turning deliveries. |
| **Good Catcher** | Spinner | Aggressive | RHB / LHB | **Deep Mid-Wicket** | Holds high swirling catches off slog-sweeps. |
| **Fast Runner** | Fast Bowler | Aggressive | RHB / LHB | **Deep Extra Cover** | Sprints boundary fence to convert 4s into singles off lofted cover drives. |
| **Fast Runner** | Spinner | Aggressive | RHB / LHB | **Deep Mid-Wicket** | Massive ground coverage between mid-wicket and long-on. |
| **Fast Runner** | Any | Defensive | RHB / LHB | **Cover Point** | Charges in to choke soft push singles. |
| **Strong Arm** | Fast Bowler | Aggressive | RHB / LHB | **Third Man** | Flat 70-meter bullet throw over stumps to keeper on fine edges. |
| **Strong Arm** | Spinner | Any | RHB / LHB | **Long On** | Flat rocket throws directly to bowler's end stumps. |
| **Good Thrower** | Fast Bowler | Aggressive | RHB / LHB | **Backward Point** | Hotspot for sharp cuts; lethal direct hit run-out threat. |
| **Good Thrower** | Spinner | Defensive | RHB / LHB | **Short Mid-Wicket** | Swift pick-and-flick underarm throws for run-out dismissals. |
| **All Rounder** | Fast Bowler | Aggressive | RHB / LHB | **Extra Cover** | Demands agility, diving stops, and rapid pick-and-throws in the 30-yard ring. |

*Note: For **Left-Hand Batsmen**, all positions automatically invert their X-axis coordinates and are correctly categorized as Left-Hand Off/Leg side.*

---

## 🎓 College Viva / Project Presentation Q&A

**Q1: What is the main objective of PitchVision?**  
*A: To provide an intelligent tactical recommendation system for cricket captains and coaches that positions individual fielders based on their athletic skills, bowler delivery style, and batsman profile.*

**Q2: Which Android UI components were used?**  
*A: `ScrollView`, `CardView`, `LinearLayout`, `TableLayout`, `EditText`, `Spinner`, `Button`, custom vector drawables, and a custom extended `View` (`CricketFieldView`) utilizing `Canvas` and `Paint`.*

**Q3: How are credentials and sessions handled?**  
*A: Using `SharedPreferences` in `UserSessionManager.java`, providing lightweight, persistent key-value storage without requiring an external server.*

**Q4: How does the custom ground view draw the pitch and boundary?**  
*A: Inside `CricketFieldView.java`, `onDraw(Canvas canvas)` computes proportional dimensions (`radiusX`, `radiusY`, `centerX`, `centerY`), drawing ovals with `Paint` for the turf and 30-yard circle, rounded rectangles for the pitch, crease lines, stumps, and pins the fielder at calculated trigonometric offsets.*

**Q5: How does the app handle Left-Handed batsmen?**  
*A: In cricket, Off-side and Leg-side are opposite for left-handers. `PositionEngine.java` inverts the X-ratio coordinate (`xRatio = -xRatio`) and updates the side metadata dynamically.*
