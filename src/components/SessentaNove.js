import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Vibration,
  StyleSheet,
} from "react-native";

const { width: LARGURA, height: ALTURA } = Dimensions.get("window");

// o diabinho aparece bem mais que os outros
const ROSTOS = [
  "😈",
  "😈",
  "😈",
  "😈",
  "😏",
  "😉",
  "🤭",
  "😳",
  "🫣",
  "😜",
  "🙈",
  "👀",
  "🥵",
];

const LEGENDAS = [
  "a posição favorita da matemática",
  "um de cabeça pra baixo e ninguém reclama",
  "o 6 e o 9 estão... calculando juntos 👀",
  "professor, eu juro que foi sem querer",
  "trabalho em equipe é tudo",
  "nem a calculadora resistiu",
];

// cada rostinho sobe flutuando e some
function Rostinho({ atraso }) {
  const subida = useRef(new Animated.Value(0)).current;
  const [config] = useState(() => ({
    rosto: ROSTOS[Math.floor(Math.random() * ROSTOS.length)],
    x: Math.random() * (LARGURA - 40),
    tamanho: 26 + Math.random() * 26,
    balanco: Math.random() * 60 - 30,
  }));

  useEffect(() => {
    Animated.loop(
      Animated.timing(subida, {
        toValue: 1,
        duration: 2200 + Math.random() * 1200,
        delay: atraso,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: config.x,
        bottom: -60,
        fontSize: config.tamanho,
        opacity: subida.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        }),
        transform: [
          {
            translateY: subida.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -ALTURA * 0.9],
            }),
          },
          {
            translateX: subida.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, config.balanco, 0],
            }),
          },
        ],
      }}
    >
      {config.rosto}
    </Animated.Text>
  );
}

export default function SessentaNove({ onFim }) {
  const giro = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(1)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  const [legenda] = useState(
    () => LEGENDAS[Math.floor(Math.random() * LEGENDAS.length)],
  );

  useEffect(() => {
    Vibration.vibrate([0, 300, 200, 300]);

    Animated.timing(entrada, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.12,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const id = setTimeout(onFim, 5000);
    return () => clearTimeout(id);
  }, []);

  const rotacao = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.fundo, { opacity: entrada }]}>
      {Array.from({ length: 16 }).map((_, i) => (
        <Rostinho key={i} atraso={i * 180} />
      ))}

      <Pressable style={styles.toque} onPress={onFim}>
        <Animated.Text
          style={[styles.titulo, { transform: [{ scale: pulso }] }]}
        >
          Nice. 😈
        </Animated.Text>

        {/* o 9 e so um 6 de ponta cabeca... e os dois girando juntos */}
        <Animated.View
          style={[styles.par, { transform: [{ rotate: rotacao }] }]}
        >
          <Text style={styles.numero}>6</Text>
          <Text style={[styles.numero, styles.deCabecaPraBaixo]}>6</Text>
        </Animated.View>

        <Text style={styles.legenda}>{legenda}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 0, 20, 0.94)",
    overflow: "hidden",
  },

  toque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    color: "#FACC15",
    fontSize: 44,
    fontWeight: "900",
    marginBottom: 40,
  },

  par: {
    flexDirection: "row",
    alignItems: "center",
  },

  numero: {
    color: "#FFFFFF",
    fontSize: 120,
    fontWeight: "900",
    marginHorizontal: 4,
  },

  deCabecaPraBaixo: {
    transform: [{ rotate: "180deg" }],
  },

  legenda: {
    color: "#F5F5F5",
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 30,
  },
});
