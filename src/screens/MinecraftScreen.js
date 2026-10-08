import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";

// versao classica oficial e gratuita, lancada pela propria Mojang
const ENDERECO = "https://classic.minecraft.net";

const LOJA =
  Platform.OS === "ios"
    ? "https://apps.apple.com/app/id479516143"
    : "market://details?id=com.mojang.minecraftpe";

export default function MinecraftScreen({ navigation }) {
  const [carregando, setCarregando] = useState(true);

  async function abrirApp() {
    try {
      await Linking.openURL("minecraft://");
    } catch {
      // se o Minecraft nao estiver instalado, abre a loja
      Linking.openURL(LOJA);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.jogo}>
        {Platform.OS === "web" ? (
          <iframe
            src={ENDERECO}
            title="Minecraft Classic"
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="fullscreen; pointer-lock"
          />
        ) : (
          <WebView
            source={{ uri: ENDERECO }}
            style={styles.web}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setCarregando(false)}
          />
        )}

        {carregando && Platform.OS !== "web" && (
          <View style={styles.carregando}>
            <ActivityIndicator size="large" color="#FACC15" />
            <Text style={styles.textCarregando}>Carregando o Minecraft...</Text>
          </View>
        )}
      </View>

      <View style={styles.barra}>
        <Pressable
          style={({ pressed }) => [styles.botao, pressed && styles.apertado]}
          onPress={() => navigation.navigate("Craft")}
        >
          <Text style={styles.textBotao}>⛏ Versão touch</Text>
        </Pressable>

        {Platform.OS !== "web" && (
          <Pressable
            style={({ pressed }) => [
              styles.botao,
              styles.principal,
              pressed && styles.apertado,
            ]}
            onPress={abrirApp}
          >
            <Text style={[styles.textBotao, styles.textPrincipal]}>
              Abrir app do Minecraft
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  jogo: {
    flex: 1,
  },

  web: {
    flex: 1,
    backgroundColor: "#000000",
  },

  carregando: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  textCarregando: {
    color: "#BFBFBF",
    fontSize: 16,
    marginTop: 12,
  },

  barra: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    paddingBottom: 20,
  },

  botao: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  principal: {
    backgroundColor: "#FACC15",
    borderColor: "#FACC15",
  },

  textBotao: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  textPrincipal: {
    color: "#000000",
  },

  apertado: {
    opacity: 0.7,
  },
});
