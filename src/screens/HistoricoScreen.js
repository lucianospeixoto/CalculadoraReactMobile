import { View, FlatList, Text, StyleSheet } from "react-native";

// o id do item e o Date.now() de quando a conta foi feita
function formatarData(id) {
  const data = new Date(Number(id));
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} às ${hora}:${minuto}`;
}

export default function HistoricoScreen({ route }) {
  const { historico } = route.params;

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.conteudo}
      data={historico}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        historico.length > 0 && (
          <Text style={styles.titulo}>
            {historico.length} {historico.length === 1 ? "conta" : "contas"}{" "}
            salvas
          </Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.data}>{formatarData(item.id)}</Text>
          <Text style={styles.conta}>{item.conta}</Text>
          <Text style={styles.resultado}>= {item.resultado}</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhuma conta ainda</Text>
          <Text style={styles.vazioTexto}>
            Faça uma conta na calculadora e aperte "=" para ela aparecer aqui.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    flex: 1,
    backgroundColor: "#000000",
  },

  conteudo: {
    padding: 16,
  },

  titulo: {
    color: "#8C8C8C",
    fontSize: 14,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FACC15",
  },

  data: {
    color: "#737373",
    fontSize: 12,
    marginBottom: 6,
  },

  conta: {
    color: "#BFBFBF",
    fontSize: 18,
    textAlign: "right",
  },

  resultado: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "right",
  },

  vazio: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },

  vazioTitulo: {
    color: "#F5F5F5",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  vazioTexto: {
    color: "#8C8C8C",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
