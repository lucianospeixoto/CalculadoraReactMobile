import { View, StyleSheet } from "react-native";
import Botao from "./Botao";

const LINHAS = [
  ["MRC", "M-", "M+", "RAIZ", "OFF"],
  ["AC", "C-", "+/-", "%"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "X"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

const FUNCOES = ["MRC", "M-", "M+", "RAIZ", "OFF"];
const ESPECIAIS = ["AC", "C-", "+/-", "%"];
const OPERADORES = ["/", "X", "-", "+"];

function tipoDaTecla(tecla) {
  if (FUNCOES.includes(tecla)) return "funcao";
  if (ESPECIAIS.includes(tecla)) return "especial";
  if (OPERADORES.includes(tecla)) return "operador";
  if (tecla === "=") return "igual";
  return "numero";
}

export default function Teclado({ onPress, bagunca }) {
  return (
    <View style={styles.teclado}>
      {LINHAS.map((linha, i) => (
        <View key={i} style={[styles.colunas, i === 0 && styles.linhaFuncoes]}>
          {linha.map((tecla) => (
            <Botao
              key={tecla}
              label={tecla}
              onPress={onPress}
              tipo={tipoDaTecla(tecla)}
              bagunca={bagunca}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  teclado: {
    width: "100%",
  },

  colunas: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },

  linhaFuncoes: {
    marginBottom: 18,
  },
});
