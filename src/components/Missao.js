import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Pulador } from "./VinteDois";

const { width: LARGURA, height: ALTURA } = Dimensions.get("window");

// onças e dinheiro espalhados pela tela, alternando
function montarItens() {
  const itens = [];
  const colunas = 4;
  const linhas = 7;
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      itens.push({
        emoji: (l + c) % 2 === 0 ? "🐆" : "💵",
        x: (c + 0.2 + Math.random() * 0.4) * (LARGURA / colunas) - 10,
        y: (l + 0.3 + Math.random() * 0.4) * (ALTURA / linhas) - 20,
      });
    }
  }
  return itens;
}

function Festa() {
  const pulso = useRef(new Animated.Value(1)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  const [itens] = useState(montarItens);

  useEffect(() => {
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
  }, []);

  return (
    <Animated.View style={[styles.festa, { opacity: entrada }]}>
      {itens.map((item, i) => (
        <Pulador key={i} emoji={item.emoji} x={item.x} y={item.y} />
      ))}

      <View style={styles.centro}>
        <View style={styles.faixa}>
          <Animated.Text
            style={[styles.missao, { transform: [{ scale: pulso }] }]}
          >
            MISSÃO
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

const ESTILHACOS = ["💥", "🔥", "💥", "🔥", "⬛", "🟨", "⬜"];

function Estilhaco({ indice }) {
  const voo = useRef(new Animated.Value(0)).current;
  const [config] = useState(() => {
    const angulo = Math.random() * Math.PI * 2;
    const distancia = 150 + Math.random() * 350;
    return {
      emoji: ESTILHACOS[indice % ESTILHACOS.length],
      x: Math.cos(angulo) * distancia,
      y: Math.sin(angulo) * distancia,
      tamanho: 22 + Math.random() * 30,
      giro: Math.random() * 720 - 360,
    };
  });

  useEffect(() => {
    Animated.timing(voo, {
      toValue: 1,
      duration: 900 + Math.random() * 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: config.tamanho,
        opacity: voo.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        }),
        transform: [
          {
            translateX: voo.interpolate({
              inputRange: [0, 1],
              outputRange: [0, config.x],
            }),
          },
          {
            translateY: voo.interpolate({
              inputRange: [0, 1],
              outputRange: [0, config.y],
            }),
          },
          {
            rotate: voo.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", config.giro + "deg"],
            }),
          },
        ],
      }}
    >
      {config.emoji}
    </Animated.Text>
  );
}

function Explosao() {
  const clarao = useRef(new Animated.Value(1)).current;
  const bola = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(clarao, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(bola, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.explosao} pointerEvents="none">
      {Array.from({ length: 30 }).map((_, i) => (
        <Estilhaco key={i} indice={i} />
      ))}

      <Animated.Text
        style={[
          styles.bola,
          {
            opacity: bola.interpolate({
              inputRange: [0, 0.6, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                scale: bola.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 5],
                }),
              },
            ],
          },
        ]}
      >
        💥
      </Animated.Text>

      <Animated.View style={[styles.clarao, { opacity: clarao }]} />
    </View>
  );
}

function Final({ onFim }) {
  const entrada = useRef(new Animated.Value(0)).current;
  const nome = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(entrada, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(nome, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const id = setTimeout(onFim, 5000);
    return () => clearTimeout(id);
  }, []);

  return (
    <Pressable style={styles.final} onPress={onFim}>
      <Animated.Text
        style={[
          styles.slogan,
          { opacity: entrada, transform: [{ scale: entrada }] },
        ]}
      >
        PRENDEU, MATOU!
      </Animated.Text>

      <Animated.View
        style={[
          styles.placa,
          {
            opacity: nome,
            transform: [
              {
                translateY: nome.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.nome}>RENAN SANTOS</Text>
        <Text style={styles.ano}>2026</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Missao({ fase, onFim }) {
  if (fase === "festa") return <Festa />;
  if (fase === "explosao") return <Explosao />;
  if (fase === "final") return <Final onFim={onFim} />;
  return null;
}

const styles = StyleSheet.create({
  festa: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    overflow: "hidden",
  },

  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  faixa: {
    backgroundColor: "#FACC15",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },

  missao: {
    color: "#000000",
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: 4,
  },

  explosao: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  bola: {
    position: "absolute",
    fontSize: 90,
  },

  clarao: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },

  final: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  slogan: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 30,
  },

  placa: {
    backgroundColor: "#FACC15",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: "center",
  },

  nome: {
    color: "#000000",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 2,
  },

  ano: {
    color: "#000000",
    fontSize: 28,
    fontWeight: "900",
  },
});
