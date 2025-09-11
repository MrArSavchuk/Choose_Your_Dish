import { useState } from "react";

export default function Filters({ onApply, onReset }) {
  const [title, setTitle] = useState("");
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");

  function apply() {
    onApply({
      query: title,
      include: include.split(",").map((s) => s.trim()).filter(Boolean),
      exclude: exclude.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  function reset() {
    setTitle("");
    setInclude("");
    setExclude("");
    onReset?.();
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="grid grid-2" style={{ gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, marginBottom: 6, color: "var(--muted)" }}>Search in title</div>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="pasta, chicken..." />
        </div>
        <div>
          <div style={{ fontSize: 13, marginBottom: 6, color: "var(--muted)" }}>Include ingredients</div>
          <input className="input" value={include} onChange={e=>setInclude(e.target.value)} placeholder="tomato, basil" />
        </div>
        <div>
          <div style={{ fontSize: 13, marginBottom: 6, color: "var(--muted)" }}>Exclude ingredients</div>
          <input className="input" value={exclude} onChange={e=>setExclude(e.target.value)} placeholder="nuts, gluten" />
        </div>
      </div>

      <div style={{ marginTop: 14, display:"flex", gap:12 }}>
        <button className="btn btn-primary" onClick={apply}>Apply</button>
        <button className="btn btn-soft" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
