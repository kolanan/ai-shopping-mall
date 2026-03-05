import AppShell from "./components/app/AppShell";
import { useAppController } from "./hooks/useAppController";

function App() {
  const app = useAppController();
  return <AppShell {...app} />;
}

export default App;
