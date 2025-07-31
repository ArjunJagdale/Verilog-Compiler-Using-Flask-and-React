# Verilog Compiler IDE (Flask + React)

A sleek and modern web-based Verilog playground. Write, compile, and debug Verilog code directly in your browser using a beautiful Monaco-powered editor, a Python + Flask backend, and AI-powered suggestions.

---

## 🚀 Preview

> 🎥 (Optionally embed local demo video/gif here)

---

## 🛠️ Tech Stack

- **Frontend:** React + Monaco Editor
- **Backend:** Python (Flask)
- **Compiler:** [Icarus Verilog (iverilog)](http://iverilog.icarus.com/)
- **AI Assistant:** OpenRouter API with Mistral LLM

---

## ✨ Features

- 💻 Monaco-based Verilog code editor (with syntax highlighting)
- ⚡ Compile and simulate Verilog via `iverilog` + `vvp`
- 🧠 Built-in **AI Debugger** (via OpenRouter's Mistral LLM)
- 🧾 Friendly compiler output with **line-based error messages** and **suggestions**
- ⌨️ `Ctrl + Enter` keyboard shortcut to run code
- 🔧 Draggable, resizable panes: Editor | Output | AI
- 🖤 Beautiful dark theme with responsive layout

---

## 🧪 Sample Code

```verilog
// 4-bit Ripple Carry Adder

module full_adder (
    input a, b, cin,
    output sum, cout
);
    assign {cout, sum} = a + b + cin;
endmodule

module ripple_carry_adder_4bit (
    input [3:0] A, B,
    input Cin,
    output [3:0] Sum,
    output Cout
);
    wire c1, c2, c3;

    full_adder FA0 (A[0], B[0], Cin,  Sum[0], c1);
    full_adder FA1 (A[1], B[1], c1,   Sum[1], c2);
    full_adder FA2 (A[2], B[2], c2,   Sum[2], c3);
    full_adder FA3 (A[3], B[3], c3,   Sum[3], Cout);
endmodule

module testbench;
    reg [3:0] A, B;
    reg Cin;
    wire [3:0] Sum;
    wire Cout;

    ripple_carry_adder_4bit RCA (
        .A(A), .B(B), .Cin(Cin), .Sum(Sum), .Cout(Cout)
    );

    initial begin
        $display("Time\tA\tB\tCin\tSum\tCout");
        $monitor("%0t\t%b\t%b\t%b\t%b\t%b", $time, A, B, Cin, Sum, Cout);

        A = 4'b0001; B = 4'b0010; Cin = 0; #10;
        A = 4'b0101; B = 4'b0011; Cin = 1; #10;
        A = 4'b1111; B = 4'b1111; Cin = 0; #10;
        A = 4'b1000; B = 4'b1000; Cin = 1; #10;

        $finish;
    end
endmodule
```

---

## ⚙️ Local Setup

### 🔹 Backend (Flask)

**Prerequisites:**
- Python 3.8+
- `iverilog` installed and in system PATH

**Steps:**
```bash
cd backend
pip install flask flask-cors
python app.py
```
> Runs at `http://localhost:5000`

---

### 🔹 Frontend (React)

**Prerequisites:**
- Node.js v18+
- npm / yarn

**Steps:**
```bash
cd frontend
npm install
npm start
```
> Runs at `http://localhost:3000`

---

## 🧩 API Details

**POST** `/compile`

**Request:**
```json
{
  "code": "// Your Verilog code here"
}
```

**Responses:**
- ✅ **Success**
```json
{ "status": "success", "stdout": "...", "stderr": "..." }
```
- ❌ **Compilation Error**
```json
{ "status": "compile_error", "errors": [...], "raw": "..." }
```
- ⚠️ **Runtime Error**
```json
{ "status": "runtime_error", "stdout": "...", "stderr": "..." }
```

---

## 🗂️ Project Structure

```
verilog-IDE/
├── backend/
│   └── app.py          # Flask backend
├── frontend/
│   ├── App.js          # React frontend
│   ├── App.css         # Styles
│   └── ...
└── README.md           # This file
```

---

## ⚠️ Known Limitations

- No support for waveform viewers or testbenches with GTKWave
- No user login or file persistence
- Requires backend running locally

---

## 📜 License

MIT License © 2025 [Arjun Jagdale](https://github.com/ArjunJagdale)
