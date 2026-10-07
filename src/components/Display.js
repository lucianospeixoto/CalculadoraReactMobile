import { View, Text, StyleSheet } from "react-native";

export default function Display({
  expressao,
  resultado,
  temMemoria,
  mensagem,
}) {
  const temResultado = resultado !== "";

  return (
    <View style={styles.box}>
      <Text style={styles.memoria}>{temMemoria ? "M" : ""}</Text>

      <Text
        style={[styles.expressao, temResultado && styles.expressaoPequena]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {expressao || "0"}
      </Text>

      <Text
        style={[styles.resultado, resultado === "Erro" && styles.erro]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {temResultado ? "= " + resultado : ""}
      </Text>

      <Text style={styles.mensagem} numberOfLines={1} adjustsFontSizeToFit>
        {mensagem}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  memoria: {
    alignSelf: "flex-start",
    color: "#FACC15",
    fontSize: 14,
    fontWeight: "bold",
    height: 18,
  },

  expressao: {
    fontSize: 56,
    fontWeight: "300",
    color: "#FFFFFF",
  },

  expressaoPequena: {
    fontSize: 30,
    color: "#8C8C8C",
  },

  resultado: {
    fontSize: 52,
    fontWeight: "500",
    color: "#FFFFFF",
    minHeight: 62,
  },

  mensagem: {
    color: "#FACC15",
    fontSize: 16,
    fontStyle: "italic",
    height: 22,
  },

  erro: {
    color: "#FACC15",
  },
});
