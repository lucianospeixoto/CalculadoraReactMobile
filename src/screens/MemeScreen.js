import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Linking,
  Vibration,
  StyleSheet,
} from "react-native";
import { carregarVistos, salvarVistos } from "../storage/memes";

// subreddits brasileiros de shitpost que ainda estao ativos
const COMUNIDADES = [
  "eu_nvr",
  "DiretoDoZapZap",
  "circojeca",
  "porramauricio",
  "MemesBR",
  "FarialimaBets",
  "ShitpostBR",
  "HumorNegroBR",
];

// meme com menos upvote que isso a galera nao achou graca
const MINIMO_DE_VOTOS = 30;

// o id do post no reddit vai crescendo com o tempo, entao da pra saber
// se o meme e recente pelo id. esse aqui e mais ou menos do comeco de 2025
const ID_MAIS_ANTIGO = parseInt("1hq0000", 36);

function idDoPost(meme) {
  return parseInt(meme.postLink.split("/").pop(), 36);
}

function embaralhar(lista) {
  return lista
    .map((item) => ({ item, sorte: Math.random() }))
    .sort((a, b) => a.sorte - b.sorte)
    .map((x) => x.item);
}

export default function MemeScreen() {
  const [meme, setMeme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const fila = useRef([]);
  const vistos = useRef(new Set());
  const buscando = useRef(null);

  // busca mais memes e coloca na fila, pulando os +18 e os ja vistos
  // busca em todas as comunidades ao mesmo tempo e junta tudo
  async function buscarTodos() {
    const respostas = await Promise.all(
      COMUNIDADES.map((comunidade) =>
        fetch(`https://meme-api.com/gimme/${comunidade}/50`)
          .then((r) => r.json())
          .then((dados) => dados.memes || [])
          .catch(() => []),
      ),
    );

    return respostas
      .flat()
      .filter(
        (m) =>
          !m.nsfw &&
          !m.spoiler &&
          /\.(jpe?g|png|gif)$/i.test(m.url) &&
          idDoPost(m) >= ID_MAIS_ANTIGO,
      );
  }

  async function encherFila() {
    const todos = await buscarTodos();
    let novos = todos.filter(
      (m) =>
        !vistos.current.has(m.url) &&
        !fila.current.some((f) => f.url === m.url),
    );

    // se ja viu todos, libera repetir (menos os ultimos 30)
    if (novos.length === 0 && todos.length > 0) {
      vistos.current = new Set([...vistos.current].slice(-30));
      novos = todos.filter((m) => !vistos.current.has(m.url));
    }

    // os bons primeiro e embaralhados, os fracos so no final
    const bons = novos.filter((m) => m.ups >= MINIMO_DE_VOTOS);
    const fracos = novos.filter((m) => m.ups < MINIMO_DE_VOTOS);
    fila.current.push(...embaralhar(bons), ...embaralhar(fracos));
  }

  async function proximo() {
    setCarregando(true);
    setErro(false);

    if (fila.current.length === 0) {
      // evita buscar duas vezes ao mesmo tempo
      if (!buscando.current) buscando.current = encherFila();
      await buscando.current;
      buscando.current = null;
    }

    const novo = fila.current.shift();
    if (!novo) {
      setCarregando(false);
      setErro(true);
      return;
    }

    vistos.current.add(novo.url);
    salvarVistos([...vistos.current]);
    setMeme(novo);

    // ja vai buscando os proximos antes de acabar
    if (fila.current.length < 4 && !buscando.current) {
      buscando.current = encherFila().finally(() => {
        buscando.current = null;
      });
    }
  }

  useEffect(() => {
    carregarVistos().then((lista) => {
      vistos.current = new Set(lista);
      proximo();
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Text style={styles.comunidade}>
          {meme ? `r/${meme.subreddit}` : "Procurando meme..."}
          {meme && <Text style={styles.votos}>{"   ⬆ " + meme.ups}</Text>}
        </Text>
        {meme && (
          <Text style={styles.titulo} numberOfLines={2}>
            {meme.title}
          </Text>
        )}
      </View>

      <Pressable
        style={styles.quadro}
        onPress={() => {
          Vibration.vibrate(15);
          proximo();
        }}
      >
        {meme && !erro && (
          <Image
            key={meme.url}
            source={{ uri: meme.url }}
            style={styles.imagem}
            resizeMode="contain"
            onLoadEnd={() => setCarregando(false)}
            onError={() => proximo()}
          />
        )}

        {carregando && (
          <View style={styles.carregando}>
            <ActivityIndicator size="large" color="#FACC15" />
            <Text style={styles.textCarregando}>Garimpando shitpost...</Text>
          </View>
        )}

        {erro && (
          <Text style={styles.textErro}>
            Os memes acabaram (ou a internet).{"\n"}Toque para tentar de novo.
          </Text>
        )}
      </Pressable>

      <View style={styles.barra}>
        <Pressable
          style={({ pressed }) => [
            styles.botao,
            styles.principal,
            pressed && styles.apertado,
          ]}
          onPress={() => {
            Vibration.vibrate(15);
            proximo();
          }}
        >
          <Text style={[styles.textBotao, styles.textPrincipal]}>
            😂 Próximo meme
          </Text>
        </Pressable>

        {meme && (
          <Pressable
            style={({ pressed }) => [styles.botao, pressed && styles.apertado]}
            onPress={() => Linking.openURL(meme.postLink)}
          >
            <Text style={styles.textBotao}>💬 Post</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  topo: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  comunidade: {
    color: "#FACC15",
    fontSize: 14,
    fontWeight: "bold",
  },

  votos: {
    color: "#8C8C8C",
    fontWeight: "normal",
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 17,
    marginTop: 4,
  },

  quadro: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  imagem: {
    width: "100%",
    height: "100%",
  },

  carregando: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },

  textCarregando: {
    color: "#BFBFBF",
    fontSize: 15,
    marginTop: 12,
  },

  textErro: {
    color: "#BFBFBF",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
  },

  barra: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    paddingBottom: 20,
  },

  botao: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  principal: {
    flex: 2,
    backgroundColor: "#FACC15",
    borderColor: "#FACC15",
  },

  textBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  textPrincipal: {
    color: "#000000",
    fontWeight: "bold",
  },

  apertado: {
    opacity: 0.7,
  },
});
