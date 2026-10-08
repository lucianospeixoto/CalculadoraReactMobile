import { useEffect, useRef, useState } from "react";
import { Text, Animated, Platform, StyleSheet } from "react-native";

const LINHAS = [
  "ERRO FATAL: a calculadora tropeçou nos próprios botões",
  "recolhendo os botões do chão ............ ok",
  "contando os números de 0 a 9 ............ ok",
  "ensinando que 2 + 2 = 4 ................. ok",
  "convencendo o 13 a ficar quietinho ...... ok",
  "tirando o π de dentro da torta .......... ok",
  "procurando a vírgula atrás do sofá ...... achei",
  "dando café pro processador ☕ ............ ok",
  "colando os botões de volta com durex .... ok",
  "pronto. tenta não quebrar de novo 😅",
];

const FONTE = Platform.OS === "ios" ? "Courier" : "monospace";

export default function Terminal({ onFim }) {
  const [qtd, setQtd] = useState(0);
  const entrada = useRef(new Animated.Value(0)).current;
  const cursor = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cursor, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cursor, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // vai mostrando uma linha de cada vez
  useEffect(() => {
    if (qtd < LINHAS.length) {
      const id = setTimeout(() => setQtd(qtd + 1), qtd === 0 ? 900 : 650);
      return () => clearTimeout(id);
    }
    const id = setTimeout(onFim, 1800);
    return () => clearTimeout(id);
  }, [qtd]);

  const porcentagem = Math.round((qtd / LINHAS.length) * 100);
  const cheios = Math.round(porcentagem / 10);
  const barra = "█".repeat(cheios) + "░".repeat(10 - cheios);

  return (
    <Animated.View style={[styles.tela, { opacity: entrada }]}>
      <Text style={styles.titulo}>CALC-OS v13.0 :: modo de recuperação</Text>

      {LINHAS.slice(0, qtd).map((linha, i) => (
        <Text key={i} style={[styles.linha, i === 0 && styles.linhaErro]}>
          {"> " + linha}
        </Text>
      ))}

      <Animated.Text style={[styles.linha, { opacity: cursor }]}>
        _
      </Animated.Text>

      <Text style={styles.barra}>
        [{barra}] {porcentagem}%
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tela: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    paddingHorizontal: 18,
    paddingTop: 60,
  },

  titulo: {
    fontFamily: FONTE,
    color: "#39FF14",
    fontSize: 14,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#39FF14",
    paddingBottom: 8,
    marginBottom: 14,
  },

  linha: {
    fontFamily: FONTE,
    color: "#39FF14",
    fontSize: 13,
    marginBottom: 6,
  },

  linhaErro: {
    color: "#FF3B3B",
    fontWeight: "bold",
  },

  barra: {
    position: "absolute",
    bottom: 50,
    left: 18,
    fontFamily: FONTE,
    color: "#FACC15",
    fontSize: 16,
  },
});
