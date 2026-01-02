# 🚁 Intelligent Delivery Drone Planner (AI Project)

A browser-based simulation that plans and optimizes a drone delivery route between multiple cities.  
The system uses:
- **Perceptron** (classification) to decide if a city’s weather is **Safe / Unsafe** for flying.
- **Simulated Annealing** (optimization) to find an improved delivery route that reduces total cost.
- **Canvas Visualization** to display cities and the route before/after optimization.

**Done by:** Waleed Rabi & Sally Najjar

---

## ✨ Features

- Generate a configurable number of delivery cities (3–20).
- Assign weather conditions:
  - **Random Weather**
  - **Manual Weather ranges** (temperature, humidity, wind)
- Train a **Perceptron** using built-in weather dataset (80% train / 20% test accuracy shown).
- Predict “Safe to Fly” for each city and display status:
  - ✅ Safe
  - ⚠️ Unsafe
- Create an **Initial Route** (random order).
- Optimize the route using **Simulated Annealing** with adjustable parameters:
  - Initial Temperature
  - Cooling Rate
- Compare **Initial Cost vs Optimized Cost** and show improvement.
- Add cities manually with custom coordinates and weather.

---

## 🧠 How It Works

### 1) Perceptron (Weather Safety Prediction)
Each city has:
- Temperature (°C)
- Humidity (%)
- Wind Speed (km/h)

The perceptron is trained on built-in weather samples and predicts:
- `0` = Safe
- `1` = Unsafe

> Features are normalized using min/max from the training set for better stability.

### 2) Route Cost
Route cost combines:
- **Distance** between consecutive cities (Euclidean distance).
- **Penalty** added when visiting an unsafe city.

Default unsafe penalty:
- `50`

### 3) Simulated Annealing (Route Optimization)
Starts with a random route and repeatedly swaps two cities to generate neighbor solutions.
A worse solution may be accepted depending on:
- current temperature
- cost difference  
This helps avoid local minima and reach better solutions over time.

---

## 🗂️ Project Structure

AiProject/
│── index.html
│── drone-planner.js
│── perceptron.js
│── simulated-annealing.js
└── README.md


---

## ▶️ Run Locally

### Option A (simple)
1. Download or clone the project.
2. Open `index.html` in any browser.

### Option B (recommended using VS Code Live Server)
1. Install **Live Server** extension in VS Code.
2. Right click `index.html` → **Open with Live Server**.

---

## ✅ How to Use (Steps)

1. Click **Generate Cities**
2. Click **Train Perceptron**
3. Click **Optimize Route**
4. Watch:
   - City safety predictions (Safe/Unsafe)
   - Initial route vs optimized route
   - Cost improvement

---

## ⚙️ Parameters

### Simulated Annealing
- **Initial Temperature**: controls exploration (higher = more random acceptance)
- **Cooling Rate**: controls how fast temperature decreases (closer to 1 = slower cooling)
- **Iterations per Temp**: set in code (default 100)

---

## 📌 Notes

- The project runs completely offline (no external libraries needed).
- Line ending warnings (LF/CRLF) are normal on Windows and not an error.

---

## 📄 License
This project is provided for educational and academic use.
