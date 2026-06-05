import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Locations } from '@/pages/Locations';
import { Forecast } from '@/pages/Forecast';
import { Recommendations } from '@/pages/Recommendations';
import { TreeAnalyze } from '@/pages/TreeAnalyze';
import { TreeHistory } from '@/pages/TreeHistory';
import { Usage } from '@/pages/Usage';
import { Settings } from '@/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="locations" element={<Locations />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="trees/analyze" element={<TreeAnalyze />} />
          <Route path="trees/history" element={<TreeHistory />} />
          <Route path="usage" element={<Usage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
