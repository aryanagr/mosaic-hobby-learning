import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { User } from "./domain/models";
import { AuthScreen } from "./screens/AuthScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { Loader } from "./components/Loader";
import { generatePlan, restoreSession } from "./services/api";
import { replacePlan, restorePlan, store } from "./store/store";

function SkillSproutApp() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([restorePlan(), restoreSession()])
      .then(([, session]) => setUser(session))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <Loader />;
  if (!user) {
    return (
      <AuthScreen
        onAuthenticated={async (authenticatedUser, isNew) => {
          if (isNew)
            store.dispatch(
              replacePlan(await generatePlan(authenticatedUser.onboarding)),
            );
          setUser(authenticatedUser);
        }}
      />
    );
  }
  return <DashboardScreen user={user} onLogout={() => setUser(null)} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#23231f"
          translucent={false}
        />
        <SkillSproutApp />
      </SafeAreaProvider>
    </Provider>
  );
}
