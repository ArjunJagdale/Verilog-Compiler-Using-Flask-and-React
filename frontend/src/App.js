import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";

function App() {
  const [code, setCode] = useState("// Verilog Playground\nmodule test;\nendmodule");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("\ud83d\udd27 Ready");
  const [aiDebug, setAiDebug] = useState("");

  const [editorFlex, setEditorFlex] = useState(6);
  const [outputFlex, setOutputFlex] = useState(3);
  const [aiFlex, setAiFlex] = useState(3);

  const isDraggingEditor = useRef(false);
  const isDraggingOutput = useRef(false);

  const runVerilog = async () => {
    setStatus("\u23f3 Compiling...");
    setOutput("");
    setAiDebug("");

    try {
      const res = await fetch("http://localhost:5000/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setStatus("\u2705 Success");
        setOutput(data.stdout || "\u2705 No Output");
        if (data.stderr) setOutput(prev => prev + "\n\u26a0\ufe0f STDERR:\n" + data.stderr);
      } else if (data.status === "compile_error") {
        setStatus("\u274c Compilation Error");

        const messages = data.errors.map(e => `\ud83d\udd34 Line ${e.line_num}: ${e.error_msg}\n  >> ${e.code_line}\n${e.suggestions.join("\n")}`);
        setOutput(messages.join("\n\n") + "\n\nRaw Log:\n" + data.raw);

        fetchAISuggestions(data.raw, code);
      } else if (data.status === "runtime_error") {
        setStatus("\u26a0\ufe0f Runtime Error");
        setOutput(`STDOUT:\n${data.stdout}\nSTDERR:\n${data.stderr}`);
      }
    } catch (err) {
      setStatus("\u2757 Backend unreachable");
      setOutput("Backend not available or Flask server not running.");
    }
  };

  const fetchAISuggestions = async (rawLog, code) => {
    try {
      const prompt = `You are a Verilog expert AI. Analyze the following compiler error log and source code, and return specific line-level fixes. 

      ✅ Output format should be compact like:

      // ❌ Old:
      original_line

      // ✅ Fixed:
      corrected_line

      Do NOT return a full code rewrite. Only give minimal necessary changes to fix errors.

      Error Log:
      ${rawLog}

      Code:
      ${code}`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.2-24b-instruct:free",
          messages: [
            { role: "system", content: "You are a helpful Verilog debugging assistant." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await res.json();
      setAiDebug(data.choices?.[0]?.message?.content || "No AI response");
    } catch (err) {
      setAiDebug("\u26a0\ufe0f Failed to fetch AI suggestions.");
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runVerilog);
  };

  const startDraggingEditor = () => (isDraggingEditor.current = true);
  const startDraggingOutput = () => (isDraggingOutput.current = true);
  const stopDragging = () => {
    isDraggingEditor.current = false;
    isDraggingOutput.current = false;
  };

  const handleMouseMove = (e) => {
    const totalWidth = window.innerWidth;

    if (isDraggingEditor.current) {
      const editorRatio = e.clientX / totalWidth;
      const outputRatio = 1 - editorRatio - aiFlex / 12;
      if (editorRatio > 0.1 && outputRatio > 0.1) {
        setEditorFlex(editorRatio * 12);
        setOutputFlex(outputRatio * 12);
      }
    }

    if (isDraggingOutput.current) {
      const editorWidth = (editorFlex / 12) * totalWidth;
      const outputWidth = e.clientX - editorWidth;
      const outputRatio = outputWidth / totalWidth;
      const aiRatio = 1 - editorFlex / 12 - outputRatio;
      if (outputRatio > 0.1 && aiRatio > 0.1) {
        setOutputFlex(outputRatio * 12);
        setAiFlex(aiRatio * 12);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
    };
  });

  return (
    <div className="app-container">
      <header className="app-header">Verilog Playground</header>

      <main className="main-split">
        <section className="editor-pane" style={{ flex: editorFlex }}>
          <div className="section-title">Code Editor</div>
          <Editor
            height="100%"
            language="verilog"
            theme="vs-dark"
            value={code}
            onChange={setCode}
            onMount={handleEditorMount}
            options={{ fontFamily: "Fira Mono, Consolas, monospace", fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
          />
          <button className="run-button" onClick={runVerilog}> Compile & Run</button>
        </section>

        <div className="resizer" onMouseDown={startDraggingEditor}></div>

        <section className="output-pane" style={{ flex: outputFlex }}>
          <div className="section-title">Output Console</div>
          <div className="status-bar">{status}</div>
          <div className="output-console">{output}</div>
        </section>

        <div className="resizer" onMouseDown={startDraggingOutput}></div>

        <section className="ai-pane" style={{ flex: aiFlex }}>
          <div className="section-title">AI Debugger</div>
          <div className="ai-console">{aiDebug}</div>
        </section>
      </main>

      <footer className="app-footer">Verilog Compiler - Purely OPEN SOURCE</footer>
    </div>
  );
}

export default App;
