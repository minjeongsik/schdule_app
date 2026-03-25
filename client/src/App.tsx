import { Navigate, Route, Routes } from "react-router-dom";
import { SchedulerDashboardPage } from "./pages/SchedulerDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SchedulerDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
