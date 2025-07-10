import { createRoot } from "react-dom/client";

function SimpleApp() {
  return <div>Hello Roastah - Test App Loading</div>;
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);