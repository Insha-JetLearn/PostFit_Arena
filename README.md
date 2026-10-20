# PoseFit Arena — AI Fitness Game

**PoseFit Arena** is a modern, high-performance, browser-based AI fitness gaming experience. It leverages your webcam and Google's **MoveNet SinglePose Lightning** via TensorFlow.js to track full-body skeletal movement in real time, calculate joint angles, evaluate repetition form, and gamify daily workouts.

> "Your Body. Your Arena. Your Challenge."

---

## Features

- **Real-Time AI Skeletal Tracking**: Browser-based MoveNet SinglePose Lightning pose estimation running at up to 30 FPS.
- **Dynamic HTML5 Canvas Overlay**: Vibrant neon teal (`#00d4aa`) and electric purple (`#7c3aed`) joints and bones synchronized directly over a mirrored webcam stream.
- **5 Comprehensive Exercise State Machines**:
  - **Squats**: Calculates knee flexion angle (< 95° down, > 158° full extension).
  - **Jumps**: Tracks vertical hip displacement relative to calibrated baseline with cooldown filters.
  - **Push-ups**: Calculates elbow angle (< 92° chest down, > 152° full arm extension).
  - **Lunges**: Tracks unilateral knee angles and alternates automatically between left and right legs.
  - **Jumping Jacks**: Computes composite overhead wrist spread and ankle width ratio.
- **3 Game Modes**:
  - **Free Play**: Unlimited, self-paced workout with real-time scoring and exercise switching.
  - **30-Second Challenge**: Fast-paced high-score sprint with countdown timer and audio cues.
  - **Routine Mode**: Guided 5-exercise circuit (Squats → Jumps → Push-ups → Lunges → Jumping Jacks) with target repetition goals and step advancement.
- **Arcade Scoring & Multiplier System**:
  - 10 points per valid rep.
  - 4-second combo window.
  - 2x multiplier upon reaching a 5-rep streak.
  - 3x multiplier upon reaching a 10-rep streak, complete with confetti particle effects.
  - Floating point badges (`+10`, `+20 COMBO!`).
- **Zero-Latency Web Audio API Synthesizer**: Synthesized sound effects for reps, combo streaks, countdown ticks, and victory fanfares without external audio dependencies.
- **100% Privacy Focused**: All computer vision processing happens strictly on your local device inside your browser. No webcam frames or images are ever transmitted or stored.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Pose Detection**: `@tensorflow/tfjs`, `@tensorflow-models/pose-detection` (MoveNet SinglePose Lightning)
- **Audio**: Web Audio API
- **Visuals & Icons**: Lucide React, Canvas Confetti

---

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine.
- A modern web browser with WebRTC and WebGL support (Chrome, Edge, Firefox, Safari).
- A connected webcam.

### Installation

```bash
npm install
```

### Development Server

Start the local Vite development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser and allow camera permissions when prompted.

### Production Build

Create an optimized production bundle:

```bash
npm run build
```

The output files will be generated in the `dist` directory, ready to deploy to Cloudflare Pages, Vercel, Netlify, or GitHub Pages.

### Preview Production Build

```bash
npm run preview
```

---

## Exercise Form Guide & Tips

1. **Camera Placement**: Position your camera approximately 6 to 8 feet away so your full body from head to feet is clearly visible.
2. **Lighting**: Ensure good, even lighting so key joints (shoulders, elbows, wrists, hips, knees, and ankles) have high confidence scores.
3. **Clothing**: High contrast workout clothes against your background improves joint accuracy.

---

## License

Apache-2.0
