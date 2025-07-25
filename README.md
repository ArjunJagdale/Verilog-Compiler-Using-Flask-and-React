# Verilog Compiler IDE (Flask + React)

This is a simple web-based Verilog IDE. You can write Verilog code in the browser, compile it using a Flask backend (with `iverilog`), and see the output instantly. It helps in learning and testing Verilog HDL quickly.

---

## Preview
![ReactApp-Brave2025-07-2412-07-58-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/0a12193b-49a5-43b6-ab23-31087afce54b)
---

## Tech Stack

- **Frontend:** React + Monaco Editor
- **Backend:** Python (Flask)
- **Compiler:** [Icarus Verilog (iverilog)](http://iverilog.icarus.com/)

---

## Features

- Verilog code editor with syntax highlighting
- Compile and run Verilog code with `iverilog` and `vvp`
- Displays errors with line numbers and suggestions
- Shows output from the simulation
- Keyboard shortcut `Ctrl+Enter` to compile
- Simple and responsive UI

---

## Local Setup

### 1. Backend (Flask)

#### Prerequisites:
- Python 3.8 or higher
- `iverilog` installed and available in system PATH

#### Steps:
```bash
cd backend
pip install flask flask-cors
python app.py
````

By default, it runs at `http://localhost:5000`

---

### 2. Frontend (React)

#### Prerequisites:

* Node.js (v18 or newer)
* npm or yarn

#### Steps:

```bash
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000` and calls the backend at port 5000.

---

## API Details

**Endpoint:** `POST /compile`

**Request Body:**

```json
{
  "code": "// Your Verilog code here"
}
```

**Responses:**

* Success:

  ```json
  { "status": "success", "stdout": "...", "stderr": "..." }
  ```

* Compilation Error:

  ```json
  { "status": "compile_error", "errors": [...], "raw": "..." }
  ```

* Runtime Error:

  ```json
  { "status": "runtime_error", "stdout": "...", "stderr": "..." }
  ```

---

## Example Verilog Code

```verilog
module test;
  initial begin
    $display("Hello Verilog!");
  end
endmodule
```

---

## Project Structure

```
verilog-IDE/
├── backend/
│   └── app.py          # Flask backend
├── frontend/
│   ├── App.js          # React frontend
│   └── App.css         # Styles
└── README.md           # This file
```

---

## Known Limitations

* No code history or file saving
* Limited to basic Verilog (no waveform viewer or debugging tools)
* Requires backend to run locally

---

## License

MIT License © 2025 [Arjun Jagdale](https://github.com/ArjunJagdale)
