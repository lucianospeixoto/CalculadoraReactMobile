import { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import Botao from "./Botao";

const LINHAS = [
  ["MRC", "M-", "M+", "RAIZ", "OFF"],
  ["AC", "C-", "+/-", "%"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "X"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

const TECLAS = LINHAS.flat();
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

// direcao em que cada tecla voa na explosao, saindo do meio do teclado
function direcaoDaExplosao(tecla) {
  const linha = LINHAS.findIndex((l) => l.includes(tecla));
  const coluna = LINHAS[linha].indexOf(tecla);
  const x = coluna - (LINHAS[linha].length - 1) / 2 + (Math.random() - 0.5);
  const y = linha - 2.5 + (Math.random() - 0.5);
  const tamanho = Math.hypot(x, y) || 1;
  const distancia = 500 + Math.random() * 400;
  return { x: (x / tamanho) * distancia, y: (y / tamanho) * distancia };
}

export default function Teclado({
  onPress,
  onSegurar,
  bagunca,
  estrela,
  caindo,
  explodindo,
}) {
  // -1 = la em cima, 0 = no lugar, 1 = caiu la embaixo
  const posicoes = useRef(TECLAS.map(() => new Animated.Value(0))).current;
  const giros = useRef(TECLAS.map(() => Math.random() * 1080 - 540)).current;
  const desvios = useRef(TECLAS.map(() => Math.random() * 160 - 80)).current;
  const jaCaiu = useRef(false);
  const explosoes = useRef(TECLAS.map(() => new Animated.Value(0))).current;
  const voos = useRef(TECLAS.map(direcaoDaExplosao)).current;
  const jaExplodiu = useRef(false);

  useEffect(() => {
    if (explodindo) {
      jaExplodiu.current = true;
      Animated.parallel(
        explosoes.map((explosao) =>
          Animated.timing(explosao, {
            toValue: 1,
            duration: 700 + Math.random() * 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ).start();
    } else if (jaExplodiu.current) {
      // as teclas voltam voando pro lugar
      jaExplodiu.current = false;
      Animated.stagger(
        35,
        explosoes.map((explosao) =>
          Animated.spring(explosao, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }, [explodindo]);

  useEffect(() => {
    if (caindo) {
      jaCaiu.current = true;
      Animated.parallel(
        posicoes.map((posicao) =>
          Animated.timing(posicao, {
            toValue: 1,
            duration: 900 + Math.random() * 700,
            delay: Math.random() * 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ),
      ).start();
    } else if (jaCaiu.current) {
      jaCaiu.current = false;
      posicoes.forEach((posicao) => posicao.setValue(-1));
      Animated.stagger(
        45,
        posicoes.map((posicao) =>
          Animated.spring(posicao, {
            toValue: 0,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }, [caindo]);

  function movimentoDa(tecla) {
    const i = TECLAS.indexOf(tecla);
    return {
      transform: [
        {
          translateY: posicoes[i].interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-900, 0, 1000],
          }),
        },
        {
          translateX: posicoes[i].interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-desvios[i], 0, desvios[i]],
          }),
        },
        {
          translateX: explosoes[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, voos[i].x],
          }),
        },
        {
          translateY: explosoes[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, voos[i].y],
          }),
        },
        {
          rotate: explosoes[i].interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", giros[i] * 1.5 + "deg"],
          }),
        },
        {
          rotate: posicoes[i].interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-giros[i] + "deg", "0deg", giros[i] + "deg"],
          }),
        },
      ],
    };
  }

  return (
    <View style={styles.teclado}>
      {LINHAS.map((linha, i) => (
        <View key={i} style={[styles.colunas, i === 0 && styles.linhaFuncoes]}>
          {linha.map((tecla) => (
            <Botao
              key={tecla}
              label={tecla}
              onPress={onPress}
              onSegurar={onSegurar}
              tipo={tipoDaTecla(tecla)}
              bagunca={bagunca}
              estrela={estrela}
              movimento={movimentoDa(tecla)}
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
