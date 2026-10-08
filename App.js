import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import HistoricoScreen from "./src/screens/HistoricoScreen";
import CobrinhaScreen from "./src/screens/CobrinhaScreen";
import CraftScreen from "./src/screens/CraftScreen";
import MinecraftScreen from "./src/screens/MinecraftScreen";
import GtaScreen from "./src/screens/GtaScreen";
import MemeScreen from "./src/screens/MemeScreen";

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
        <Stack.Screen
          name="Cobrinha"
          component={CobrinhaScreen}
          options={{ title: "Cobrinha" }}
        />
        <Stack.Screen
          name="Craft"
          component={CraftScreen}
          options={{ title: "CalcCraft ⛏" }}
        />
        <Stack.Screen
          name="Minecraft"
          component={MinecraftScreen}
          options={{ title: "Minecraft" }}
        />
        <Stack.Screen
          name="Gta"
          component={GtaScreen}
          options={{ title: "Grand Theft Calc" }}
        />
        <Stack.Screen
          name="Meme"
          component={MemeScreen}
          options={{ title: "Memes BR 😂" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
