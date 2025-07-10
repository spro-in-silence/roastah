import { createRoot } from "react-dom/client";
import "./index.css";

// Temporary simple test to check if React is working
function TestApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🚀 Roastah Test App</h1>
      <p>React is working! Now let's test the main app...</p>
      <button onClick={() => console.log("Button clicked!")}>Test Button</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TestApp />);
