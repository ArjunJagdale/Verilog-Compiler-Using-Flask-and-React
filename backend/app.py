# backend/app.py
from flask import Flask, request, jsonify
import subprocess
import tempfile
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows React to call this API during development

def parse_errors(error_log: str, verilog_code: str):
    lines = verilog_code.splitlines()
    error_entries = []
    pattern = r":(\d+): (.+)"

    for match in re.finditer(pattern, error_log):
        line_num = int(match.group(1))
        error_msg = match.group(2).strip()
        code_line = lines[line_num - 1] if 0 < line_num <= len(lines) else "Line not found."

        suggestions = []
        if "inpu" in code_line:
            suggestions.append("💡 Did you mean `input`?")
        if ("endmodule" not in code_line and ";" not in code_line and
                not code_line.strip().endswith("begin") and
                not code_line.strip().startswith("//")):
            suggestions.append("💡 Possible missing semicolon (`;`) at the end.")
        if "Invalid module instantiation" in error_msg:
            suggestions.append("💡 Check if the module name or ports are declared correctly.")

        error_entries.append({
            "line_num": line_num,
            "error_msg": error_msg,
            "code_line": code_line.strip(),
            "suggestions": suggestions
        })

    return error_entries

@app.route("/compile", methods=["POST"])
def compile_verilog():
    verilog_code = request.json.get("code", "")
    with tempfile.TemporaryDirectory() as tmpdir:
        source_file = os.path.join(tmpdir, "test.v")
        output_file = os.path.join(tmpdir, "a.out")

        with open(source_file, "w") as f:
            f.write(verilog_code)

        compile_cmd = ["iverilog", "-o", output_file, source_file]
        compile_proc = subprocess.run(compile_cmd, capture_output=True, text=True)

        if compile_proc.returncode != 0:
            errors = parse_errors(compile_proc.stderr, verilog_code)
            return jsonify({
                "status": "compile_error",
                "errors": errors,
                "raw": compile_proc.stderr
            })

        run_proc = subprocess.run(["vvp", output_file], capture_output=True, text=True)
        if run_proc.returncode != 0:
            return jsonify({
                "status": "runtime_error",
                "stdout": run_proc.stdout,
                "stderr": run_proc.stderr
            })

        return jsonify({
            "status": "success",
            "stdout": run_proc.stdout,
            "stderr": run_proc.stderr
        })


if __name__ == "__main__":
    app.run(port=5000, debug=True)
