# Sunrise Squad — Kids Morning Routine Tracker

A playful, colorful website for tracking kids' daily morning routines. Built as
plain HTML/CSS/JS — no build step, no backend, no dependencies.

## Kids & routine
- Two kids: **Yaer** (🦖, blue theme) and **Tamar** (🦄, pink/purple theme).
- Routine steps: Wake up, Say Modeh Ani, Wash hands, Brush teeth, Get dressed,
  Make bed, Eat breakfast, Put on shoes.
- Add/remove/reorder tasks by editing the `TASKS` array in `script.js`.
- Add/rename kids by editing the `KIDS` object in `script.js` (also update the
  buttons in `index.html`'s `#kid-picker`).

## Features
- Tap a task to check it off; per-kid progress bar and daily streak counter.
- Streak increments once per day when all tasks are completed; resets if a day
  is missed.
- Checklist auto-resets each morning (based on the device's local date).
- Confetti animation + cheerful chime (generated with the Web Audio API, no
  audio files needed) when a kid finishes their whole routine.
- All state is stored in the browser's `localStorage` — per-device, no login,
  no server needed.

## Running
- Workflow **Start application** runs `python3 -m http.server 5000` to serve
  the static files. No install step required.

## Files
- `index.html` — page structure and task list container.
- `style.css` — visual design (gradients, cards, kid color themes).
- `script.js` — state management, rendering, confetti, and sound.

## User preferences
None recorded yet.
