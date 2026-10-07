import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE = "historico";

export async function salvar(lista) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(lista));
}

export async function carregar() {
  const texto = await AsyncStorage.getItem(CHAVE);
  return texto ? JSON.parse(texto) : [];
}
