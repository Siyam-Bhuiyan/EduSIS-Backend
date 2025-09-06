// App.js (root)
import React from "react";
import {
  NavigationContainer,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
} from "@react-navigation/native";
// keep your current path
import RootNavigator from "./navigation/RootNavigator";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";
import { UserProvider } from "./contexts/UserContext";

function WithNavigation() {
  const { isDark } = useTheme();
  return (
    <NavigationContainer theme={isDark ? NavDarkTheme : NavLightTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <WithNavigation />
      </ThemeProvider>
    </UserProvider>
  );
}
