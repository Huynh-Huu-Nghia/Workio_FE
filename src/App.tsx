// src/App.tsx
import { RouterProvider } from "react-router";
import { AppRouter } from "./routes";
import { ToastContainer } from "react-toastify"; // <-- Đảm bảo có dòng này

function App() {
  return (
    <>
      <RouterProvider router={AppRouter} />
      <ToastContainer /> {/* <-- Và có dòng này */}
    </>
  );
}

export default App;
