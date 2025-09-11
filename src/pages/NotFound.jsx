import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section style={{textAlign:"center",padding:"60px 0"}}>
      <div style={{fontSize:54,fontWeight:900,marginBottom:8}}>404</div>
      <div style={{opacity:.7,marginBottom:16}}>Page not found</div>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </section>
  );
}
