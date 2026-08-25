import { StatusBar } from "expo-status-bar";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.titulo}>Calculadora Mobile</Text>

      <Text style={styles.painel}>0</Text>

      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textBotaoPequeno}>MRC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textBotaoPequeno}>M-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textBotaoPequeno}>M+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textBotaoPequeno}>RAIZ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textBotaoPequeno}>OFF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>AC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>C-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>+/-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>%</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>9</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>/</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>6</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>X</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>-</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>=</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  titulo: {
    textAlign: "center",
    color: "#8257E5",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: "auto",
    marginTop: 50,
  },

  painel: {
    width: "100%",
    textAlign: "right",
    fontSize: 56,
    fontWeight: "300",
    color: "#FFFFFF",
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },

  colunas: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },

  botao: {
    backgroundColor: "#29292E",
    borderRadius: 16,
    height: 48,
    width: "18%",
    alignItems: "center",
    justifyContent: "center",
  },

  textBotaoPequeno: {
    color: "#E1E1E6",
    fontSize: 12,
    fontWeight: "bold",
  },

  botaoNumeros: {
    backgroundColor: "#202024",
    borderRadius: 20,
    height: 68,
    width: "22%",
    alignItems: "center",
    justifyContent: "center",
  },

  textNumeros: {
    fontSize: 24,
    fontWeight: "500",
    color: "#FBA94C",
    textAlign: "center",
  },
});