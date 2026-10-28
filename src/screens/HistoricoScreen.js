import { useState } from "react";
import { View, FlatList, Text, StyleSheet, Pressable } from "react-native";
import { limpar, salvar } from "../storage/historico";

// o id do item e o Date.now() de quando a conta foi feita
function formatarData(id) {
  const data = new Date(Number(id));
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} às ${hora}:${minuto}`;
}

export default function HistoricoScreen({ route, navigation }) {
  const [lista, setLista] = useState(route.params?.historico ?? []);

  async function limparHistorico() {
    await limpar();
    setLista([]);
  }

  async function excluir(id) {
    const nova = lista.filter((item) => item.id !== id);
    setLista(nova);
    await salvar(nova);
  }

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.conteudo}
      data={lista}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        lista.length > 0 && (
          <Text style={styles.titulo}>
            {lista.length} {lista.length === 1 ? "conta" : "contas"}{" "}
            salvas
          </Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.linha}>
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressionado]}
            onPress={() =>
              navigation.popTo("Home", {
                conta: item.conta,
                valor: item.resultado,
                reutilizacaoId: Date.now(),
              })
            }
          >
            <Text style={styles.data}>{formatarData(item.id)}</Text>
            <Text style={styles.conta}>{item.conta}</Text>
            <Text style={styles.resultado}>= {item.resultado}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Excluir conta"
            style={({ pressed }) => [styles.excluir, pressed && styles.pressionado]}
            onPress={() => excluir(item.id)}
          >
            <Text style={styles.textoExcluir}>×</Text>
          </Pressable>
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
      ListFooterComponent={
        lista.length > 0 && (
          <Pressable
            style={({ pressed }) => [styles.limpar, pressed && styles.pressionado]}
            onPress={limparHistorico}
          >
            <Text style={styles.textoLimpar}>Limpar histórico</Text>
          </Pressable>
        )
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
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FACC15",
  },

  linha: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },

  excluir: {
    width: 48,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  textoExcluir: {
    color: "#FACC15",
    fontSize: 28,
  },

  limpar: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  textoLimpar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  pressionado: {
    opacity: 0.7,
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
