// App.js
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";

function App() {
  const [code, setCode] = useState("// Verilog Playground\nmodule test;\nendmodule");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("🔧 Ready");

  // Execute Verilog code via backend API
  const runVerilog = async () => {
    setStatus("⏳ Compiling...");
    setOutput("");

    try {
      const res = await fetch("http://localhost:5000/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setStatus("✅ Success");
        setOutput(data.stdout || "✅ No Output");

        if (data.stderr) {
          setOutput(prev => prev + "\n⚠️ STDERR:\n" + data.stderr);
        }

      } else if (data.status === "compile_error") {
        setStatus("❌ Compilation Error");

        const messages = data.errors.map(e =>
          `🔴 Line ${e.line_num}: ${e.error_msg}\n  >> ${e.code_line}\n${e.suggestions.join('\n')}`
        );

        setOutput(messages.join("\n\n") + "\n\nRaw Log:\n" + data.raw);

      } else if (data.status === "runtime_error") {
        setStatus("⚠️ Runtime Error");
        setOutput(`STDOUT:\n${data.stdout}\nSTDERR:\n${data.stderr}`);
      }

    } catch (err) {
      setStatus("❗ Backend unreachable");
      setOutput("Backend not available or Flask server not running.");
    }
  };

  // Bind Ctrl+Enter to run function
  const handleEditorMount = (editor, monaco) => {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      runVerilog
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">💻 Verilog Playground</header>

      <main className="main-split">
        {/* Editor Panel */}
        <section className="editor-pane">
          <div className="section-title">📄 Code Editor</div>
          <Editor
            height="100%"
            language="verilog"
            theme="vs-dark"
            value={code}
            onChange={value => setCode(value)}
            onMount={handleEditorMount}
            options={{
              fontFamily: "Fira Mono, Consolas, monospace",
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
          <button className="run-button" onClick={runVerilog}>
            ▶ Compile & Run
          </button>
        </section>

        {/* Output Panel */}
        <section className="output-pane">
          <div className="section-title">🖨 Output Console</div>
          <div className="status-bar">{status}</div>
          <div className="output-console">{output}</div>
        </section>
      </main>

      <footer className="app-footer">Built with ❤️ using React, Flask & Monaco Editor</footer>
    </div>
  );
}

export default App;
