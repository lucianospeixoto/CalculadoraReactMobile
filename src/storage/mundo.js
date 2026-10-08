import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE = "mundoCraft";

export async function salvarMundo(dados) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(dados));
}

export async function carregarMundo() {
  const texto = await AsyncStorage.getItem(CHAVE);
  return texto ? JSON.parse(texto) : null;
}
