// src/components/Pagination.jsx
import React from "react";

export default function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(total, page + 1));
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" className="pager-btn btn-press" onClick={prev} disabled={page === 1} aria-label="Previous page">Prev</button>
      <span className="pager-num" aria-current="page">{page}</span>
      <button type="button" className="pager-btn btn-press" onClick={next} disabled={page === total} aria-label="Next page">Next</button>
    </nav>
  );
}
