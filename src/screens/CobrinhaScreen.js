import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  PanResponder,
  Dimensions,
  Vibration,
  Platform,
  StyleSheet,
} from "react-native";
import { carregarRecorde, salvarRecorde } from "../storage/recorde";

const COLUNAS = 15;
const LINHAS = 17;
// no computador a tela e muito larga, entao limita o tamanho do tabuleiro
const LARGURA = Math.min(Dimensions.get("window").width, 420);
const TAMANHO = Math.floor((LARGURA - 32) / COLUNAS);

const CIMA = { x: 0, y: -1 };
const BAIXO = { x: 0, y: 1 };
const ESQUERDA = { x: -1, y: 0 };
const DIREITA = { x: 1, y: 0 };

function sortear(max) {
  return Math.floor(Math.random() * max);
}

function mesmaPosicao(a, b) {
  return a.x === b.x && a.y === b.y;
}

// sorteia um lugar que nao esteja em cima da cobra
function novaComida(cobra) {
  while (true) {
    const lugar = { x: sortear(COLUNAS), y: sortear(LINHAS) };
    if (!cobra.some((parte) => mesmaPosicao(parte, lugar))) return lugar;
  }
}

function jogoNovo() {
  const cobra = [
    { x: 7, y: 8 },
    { x: 6, y: 8 },
    { x: 5, y: 8 },
  ];
  return { cobra, comida: novaComida(cobra), pontos: 0, fim: false };
}

export default function CobrinhaScreen() {
  const [jogo, setJogo] = useState(jogoNovo);
  const [estado, setEstado] = useState("pronto"); // pronto, jogando ou fim
  const [recorde, setRecorde] = useState(0);
  const direcao = useRef(DIREITA);
  const ultimaDirecao = useRef(DIREITA);

  const velocidade = Math.max(70, 180 - jogo.pontos * 6);

  useEffect(() => {
    carregarRecorde().then(setRecorde);
  }, []);

  // no navegador da pra jogar com as setas do teclado (ou W A S D)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const teclas = {
      ArrowUp: CIMA,
      ArrowDown: BAIXO,
      ArrowLeft: ESQUERDA,
      ArrowRight: DIREITA,
      w: CIMA,
      s: BAIXO,
      a: ESQUERDA,
      d: DIREITA,
    };

    function aoApertar(e) {
      const nova = teclas[e.key] || teclas[e.key.toLowerCase()];
      if (nova) {
        e.preventDefault();
        mudarDirecao(nova);
      } else if ((e.key === "Enter" || e.key === " ") && estado !== "jogando") {
        e.preventDefault();
        comecar();
      }
    }

    window.addEventListener("keydown", aoApertar);
    return () => window.removeEventListener("keydown", aoApertar);
  }, [estado]);

  // loop do jogo: a cada "velocidade" ms a cobra anda uma casa
  useEffect(() => {
    if (estado !== "jogando") return;
    const id = setInterval(() => setJogo(andar), velocidade);
    return () => clearInterval(id);
  }, [estado, velocidade]);

  useEffect(() => {
    if (!jogo.fim) return;
    setEstado("fim");
    Vibration.vibrate(400);

    if (jogo.pontos > recorde) {
      setRecorde(jogo.pontos);
      salvarRecorde(jogo.pontos);
    }
  }, [jogo.fim]);

  function andar(atual) {
    if (atual.fim) return atual;

    const dir = direcao.current;
    ultimaDirecao.current = dir;

    const cabeca = { x: atual.cobra[0].x + dir.x, y: atual.cobra[0].y + dir.y };

    const bateuNaParede =
      cabeca.x < 0 || cabeca.x >= COLUNAS || cabeca.y < 0 || cabeca.y >= LINHAS;
    // o rabo sai do lugar nesse passo, entao nao conta
    const bateuNelaMesma = atual.cobra
      .slice(0, -1)
      .some((parte) => mesmaPosicao(parte, cabeca));

    if (bateuNaParede || bateuNelaMesma) return { ...atual, fim: true };

    const comeu = mesmaPosicao(cabeca, atual.comida);
    const cobra = [cabeca, ...atual.cobra];
    if (!comeu) cobra.pop();
    if (comeu) Vibration.vibrate(30);

    return {
      cobra,
      comida: comeu ? novaComida(cobra) : atual.comida,
      pontos: comeu ? atual.pontos + 1 : atual.pontos,
      fim: false,
    };
  }

  function mudarDirecao(nova) {
    const ultima = ultimaDirecao.current;
    // nao deixa a cobra dar meia volta em cima dela mesma
    if (nova.x === -ultima.x && nova.y === -ultima.y) return;
    direcao.current = nova;
  }

  function comecar() {
    direcao.current = DIREITA;
    ultimaDirecao.current = DIREITA;
    setJogo(jogoNovo());
    setEstado("jogando");
  }

  // deslizar o dedo no tabuleiro tambem muda a direcao
  const deslize = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, g) =>
        Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderRelease: (e, g) => {
        if (Math.abs(g.dx) > Math.abs(g.dy)) {
          mudarDirecao(g.dx > 0 ? DIREITA : ESQUERDA);
        } else {
          mudarDirecao(g.dy > 0 ? BAIXO : CIMA);
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.placar}>
        <Text style={styles.pontos}>Pontos: {jogo.pontos}</Text>
        <Text style={styles.recorde}>Recorde: {recorde}</Text>
      </View>

      <View style={styles.tabuleiro} {...deslize.panHandlers}>
        <View
          style={[
            styles.comida,
            { left: jogo.comida.x * TAMANHO, top: jogo.comida.y * TAMANHO },
          ]}
        />

        {jogo.cobra.map((parte, i) => (
          <View
            key={i}
            style={[
              styles.parte,
              i === 0 && styles.cabeca,
              { left: parte.x * TAMANHO, top: parte.y * TAMANHO },
            ]}
          />
        ))}

        {estado !== "jogando" && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTitulo}>
              {estado === "fim" ? "Fim de jogo!" : "Cobrinha 🐍"}
            </Text>
            <Text style={styles.avisoTexto}>
              {estado === "fim"
                ? `Você fez ${jogo.pontos} ${jogo.pontos === 1 ? "ponto" : "pontos"}`
                : "Use as setas ou deslize o dedo"}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.jogar,
                pressed && styles.apertado,
              ]}
              onPress={comecar}
            >
              <Text style={styles.textJogar}>
                {estado === "fim" ? "Jogar de novo" : "Jogar"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.controles}>
        <Seta simbolo="▲" onPress={() => mudarDirecao(CIMA)} />
        <View style={styles.linhaSetas}>
          <Seta simbolo="◀" onPress={() => mudarDirecao(ESQUERDA)} />
          <View style={styles.espaco} />
          <Seta simbolo="▶" onPress={() => mudarDirecao(DIREITA)} />
        </View>
        <Seta simbolo="▼" onPress={() => mudarDirecao(BAIXO)} />
      </View>
    </View>
  );
}

function Seta({ simbolo, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.seta, pressed && styles.apertado]}
      onPressIn={onPress}
    >
      <Text style={styles.textSeta}>{simbolo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    paddingTop: 10,
  },

  placar: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: COLUNAS * TAMANHO,
    marginBottom: 8,
  },

  pontos: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  recorde: {
    color: "#FACC15",
    fontSize: 18,
  },

  tabuleiro: {
    width: COLUNAS * TAMANHO,
    height: LINHAS * TAMANHO,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 6,
    overflow: "hidden",
  },

  parte: {
    position: "absolute",
    width: TAMANHO - 2,
    height: TAMANHO - 2,
    margin: 1,
    borderRadius: 4,
    backgroundColor: "#FACC15",
  },

  cabeca: {
    backgroundColor: "#FFFFFF",
  },

  comida: {
    position: "absolute",
    width: TAMANHO - 6,
    height: TAMANHO - 6,
    margin: 3,
    borderRadius: TAMANHO,
    backgroundColor: "#FF4D4D",
  },

  aviso: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  avisoTitulo: {
    color: "#FACC15",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },

  avisoTexto: {
    color: "#BFBFBF",
    fontSize: 16,
    marginBottom: 20,
  },

  jogar: {
    backgroundColor: "#FACC15",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },

  textJogar: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },

  controles: {
    alignItems: "center",
    marginTop: 16,
  },

  linhaSetas: {
    flexDirection: "row",
  },

  espaco: {
    width: 64,
  },

  seta: {
    width: 64,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    margin: 3,
  },

  textSeta: {
    color: "#FACC15",
    fontSize: 24,
  },

  apertado: {
    opacity: 0.6,
  },
});
