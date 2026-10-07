import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import HistoricoScreen from "./src/screens/HistoricoScreen";

const Stack = createNativeStackNavigator();

const tema = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#FACC15",
    background: "#000000",
    card: "#000000",
  },
};

export default function App() {
  return (
    <NavigationContainer theme={tema}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTintColor: "#FACC15",
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Calculadora Mobile" }}
        />
        <Stack.Screen
          name="Historico"
          component={HistoricoScreen}
          options={{ title: "Histórico" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
