import { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Vibration,
  StyleSheet,
} from "react-native";

const { width: LARGURA, height: ALTURA } = Dimensions.get("window");

// cada item fica pulando no lugar, igual torcida
export function Pulador({ emoji, x, y }) {
  const pulo = useRef(new Animated.Value(0)).current;
  const balanco = useRef(new Animated.Value(0)).current;
  const [config] = useState(() => ({
    tamanho: 30 + Math.random() * 22,
    altura: 30 + Math.random() * 40,
    duracao: 350 + Math.random() * 250,
    atraso: Math.random() * 400,
  }));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(config.atraso),
        Animated.timing(pulo, {
          toValue: 1,
          duration: config.duracao,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulo, {
          toValue: 0,
          duration: config.duracao,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(balanco, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(balanco, {
          toValue: -1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: config.tamanho,
        transform: [
          {
            translateY: pulo.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -config.altura],
            }),
          },
          {
            rotate: balanco.interpolate({
              inputRange: [-1, 1],
              outputRange: ["-15deg", "15deg"],
            }),
          },
        ],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

// espalha bandeiras e arminhas pela tela, alternando
function montarItens() {
  const itens = [];
  const colunas = 4;
  const linhas = 7;
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      itens.push({
        emoji: (l + c) % 2 === 0 ? "🇧🇷" : "🔫",
        x: (c + 0.2 + Math.random() * 0.4) * (LARGURA / colunas) - 10,
        y: (l + 0.3 + Math.random() * 0.4) * (ALTURA / linhas) - 20,
      });
    }
  }
  return itens;
}

export default function VinteDois({ onFim }) {
  const pulso = useRef(new Animated.Value(1)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  const [itens] = useState(montarItens);

  useEffect(() => {
    Vibration.vibrate([0, 150, 100, 150, 100, 400]);

    Animated.timing(entrada, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.2,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const id = setTimeout(onFim, 5000);
    return () => clearTimeout(id);
  }, []);

  return (
    <Animated.View style={[styles.fundo, { opacity: entrada }]}>
      {itens.map((item, i) => (
        <Pulador key={i} emoji={item.emoji} x={item.x} y={item.y} />
      ))}

      <Pressable style={styles.toque} onPress={onFim}>
        <View style={styles.faixa}>
          <Animated.Text
            style={[styles.mito, { transform: [{ scale: pulso }] }]}
          >
            MITO
          </Animated.Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 60, 20, 0.95)",
    overflow: "hidden",
  },

  toque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  faixa: {
    backgroundColor: "#002776",
    borderWidth: 4,
    borderColor: "#FFDF00",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },

  mito: {
    color: "#FFDF00",
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: 6,
    textShadowColor: "#009C3B",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
  },
});
