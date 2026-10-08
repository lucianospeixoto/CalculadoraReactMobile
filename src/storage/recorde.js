import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE = "recordeCobrinha";

export async function salvarRecorde(pontos) {
  await AsyncStorage.setItem(CHAVE, String(pontos));
}

export async function carregarRecorde() {
  const texto = await AsyncStorage.getItem(CHAVE);
  return texto ? Number(texto) : 0;
}
