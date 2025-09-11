import { useState } from "react";

export default function Filters({ onApply, onReset, initial }) {
  const [q, setQ] = useState(initial?.q || "");
  const [include, setInclude] = useState(initial?.include || "");
  const [exclude, setExclude] = useState(initial?.exclude || "");

  const apply = () => onApply({ q, include, exclude });
  const reset = () => {
    setQ("");
    setInclude("");
    setExclude("");
    onReset?.();
  };

  return (
    <div className="container" style={{ marginTop: 12 }}>
      <div
        className="card"
        style={{
          padding: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto auto",
          gap: 12,
        }}
      >
        <div>
          <label style={{ fontSize: 12, opacity: 0.8 }}>Search in title</label>
          <input
            className="input"
            placeholder="pasta, chicken..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, opacity: 0.8 }}>Include ingredients</label>
          <input
            className="input"
            placeholder="tomato, basil"
            value={include}
            onChange={(e) => setInclude(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, opacity: 0.8 }}>Exclude ingredients</label>
          <input
            className="input"
            placeholder="nuts, gluten"
            value={exclude}
            onChange={(e) => setExclude(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-pill" onClick={apply}>
          Apply
        </button>
        <button className="btn btn-pill" style={{ boxShadow: "0 0 0 2px rgba(255,255,255,.06) inset" }} onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
