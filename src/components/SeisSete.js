import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Pressable,
  Animated,
  Vibration,
  StyleSheet,
} from "react-native";

const LEGENDAS = [
  "🏀 o LaMelo aprovou",
  "foi 6 ou foi 7? sim.",
  "professor, isso não é matemática 😭",
  "nem a calculadora aguenta",
  "mais ou menos... 🤷",
];

export default function SeisSete({ onFim }) {
  const balanco = useRef(new Animated.Value(-1)).current;
  const pulso = useRef(new Animated.Value(1)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  const [legenda] = useState(
    () => LEGENDAS[Math.floor(Math.random() * LEGENDAS.length)],
  );

  useEffect(() => {
    Vibration.vibrate([0, 120, 180, 120, 180, 120, 180, 120]);

    Animated.timing(entrada, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // as maos sobem e descem alternando, igual o gesto do meme
    Animated.loop(
      Animated.sequence([
        Animated.timing(balanco, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(balanco, {
          toValue: -1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.15,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const id = setTimeout(onFim, 4500);
    return () => clearTimeout(id);
  }, []);

  const subindo = balanco.interpolate({
    inputRange: [-1, 1],
    outputRange: [-45, 45],
  });
  const descendo = balanco.interpolate({
    inputRange: [-1, 1],
    outputRange: [45, -45],
  });

  return (
    <Animated.View style={[styles.fundo, { opacity: entrada }]}>
      <Pressable style={styles.toque} onPress={onFim}>
        <Animated.Text
          style={[styles.titulo, { transform: [{ scale: pulso }] }]}
        >
          SIX SEVEN!
        </Animated.Text>

        <View style={styles.maos}>
          <Animated.View
            style={[styles.lado, { transform: [{ translateY: subindo }] }]}
          >
            <Text style={styles.numero}>6</Text>
            <Text style={styles.mao}>🫴</Text>
          </Animated.View>

          <Animated.View
            style={[styles.lado, { transform: [{ translateY: descendo }] }]}
          >
            <Text style={styles.numero}>7</Text>
            <Text style={[styles.mao, styles.maoEspelhada]}>🫴</Text>
          </Animated.View>
        </View>

        <Text style={styles.legenda}>{legenda}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
  },

  toque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    color: "#FACC15",
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 50,
  },

  maos: {
    flexDirection: "row",
    gap: 50,
  },

  lado: {
    alignItems: "center",
  },

  numero: {
    color: "#FFFFFF",
    fontSize: 110,
    fontWeight: "900",
  },

  mao: {
    fontSize: 60,
  },

  maoEspelhada: {
    transform: [{ scaleX: -1 }],
  },

  legenda: {
    color: "#BFBFBF",
    fontSize: 18,
    fontStyle: "italic",
    marginTop: 60,
  },
});
