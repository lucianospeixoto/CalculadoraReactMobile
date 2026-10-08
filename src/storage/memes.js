import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE = "memesVistos";

// guarda so os ultimos 600 pra nao crescer pra sempre
export async function salvarVistos(lista) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(lista.slice(-600)));
}

export async function carregarVistos() {
  const texto = await AsyncStorage.getItem(CHAVE);
  return texto ? JSON.parse(texto) : [];
}
