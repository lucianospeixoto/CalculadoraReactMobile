import { Pressable, Text, StyleSheet } from "react-native";

const CORES = [
  "#FACC15",
  "#FF4D4D",
  "#4DD2FF",
  "#7CFF4D",
  "#FF66CC",
  "#FFFFFF",
];

export default function Botao({ label, onPress, tipo, bagunca }) {
  const corAleatoria = CORES[Math.floor(Math.random() * CORES.length)];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.botao,
        styles[tipo],
        bagunca && { backgroundColor: corAleatoria },
        pressed && styles.pressionado,
      ]}
      onPress={() => onPress(label)}
    >
      <Text
        style={[
          styles.texto,
          styles["texto_" + tipo],
          bagunca && { color: "#000000" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    height: 64,
    width: "22%",
    alignItems: "center",
    justifyContent: "center",
  },

  // linha de cima (memoria, raiz, off)
  funcao: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 14,
    height: 40,
    width: "18%",
  },

  // AC, C-, +/- e %
  especial: {
    backgroundColor: "#333333",
  },

  operador: {
    backgroundColor: "#262626",
  },

  igual: {
    backgroundColor: "#FACC15",
  },

  pressionado: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },

  texto: {
    fontSize: 26,
    fontWeight: "500",
    color: "#F5F5F5",
  },

  texto_funcao: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8C8C8C",
  },

  texto_especial: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  texto_operador: {
    fontSize: 28,
    color: "#FACC15",
  },

  texto_igual: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000000",
  },
});
