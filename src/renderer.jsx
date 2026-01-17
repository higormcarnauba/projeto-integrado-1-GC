import { createRoot } from "react-dom/client";
import Hello from "./components/Hello";
import LoginPage from "./authentication/login";
import { CssBaseline } from "@mui/material";

const App = () => {
  return (
    <>
      <Hello />
    </>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);