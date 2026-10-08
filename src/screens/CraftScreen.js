import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Dimensions,
  Vibration,
  StyleSheet,
} from "react-native";
import { carregarMundo, salvarMundo } from "../storage/mundo";

const COLUNAS = 12;
const LINHAS = 14;
const LARGURA = Math.min(Dimensions.get("window").width, 420);
const TAMANHO = Math.floor((LARGURA - 16) / COLUNAS);

// dureza = quantos toques precisa para quebrar
const BLOCOS = {
  grama: {
    nome: "Grama",
    cor: "#8B5A2B",
    topo: "#5DBB3F",
    dureza: 1,
    solta: "terra",
  },
  terra: { nome: "Terra", cor: "#8B5A2B", dureza: 1 },
  pedra: { nome: "Pedra", cor: "#808080", dureza: 3 },
  madeira: { nome: "Madeira", cor: "#9C6B30", listra: "#6E4A1F", dureza: 2 },
  folha: { nome: "Folha", cor: "#2E8B2E", dureza: 1 },
  carvao: { nome: "Carvão", cor: "#808080", mancha: "#1C1C1C", dureza: 3 },
  ferro: { nome: "Ferro", cor: "#808080", mancha: "#E0B48C", dureza: 4 },
  diamante: { nome: "Diamante", cor: "#808080", mancha: "#4FF0F0", dureza: 5 },
  bedrock: {
    nome: "Bedrock",
    cor: "#333333",
    mancha: "#111111",
    dureza: Infinity,
  },
};

const INVENTARIO_VAZIO = {
  terra: 0,
  pedra: 0,
  madeira: 0,
  folha: 0,
  carvao: 0,
  ferro: 0,
  diamante: 0,
};
const ITENS = Object.keys(INVENTARIO_VAZIO);

function gerarMundo() {
  const mundo = [];
  for (let y = 0; y < LINHAS; y++) mundo.push(Array(COLUNAS).fill("ar"));

  let altura = 6;
  const superficie = [];
  for (let x = 0; x < COLUNAS; x++) {
    altura += Math.floor(Math.random() * 3) - 1;
    altura = Math.max(5, Math.min(8, altura));
    superficie.push(altura);

    for (let y = altura; y < LINHAS; y++) {
      const sorte = Math.random();
      const fundo = y >= LINHAS - 4;

      if (y === LINHAS - 1) mundo[y][x] = "bedrock";
      else if (y === altura) mundo[y][x] = "grama";
      else if (y < altura + 3) mundo[y][x] = "terra";
      else if (fundo && sorte < 0.06) mundo[y][x] = "diamante";
      else if (sorte < 0.08) mundo[y][x] = "carvao";
      else if (sorte < 0.13) mundo[y][x] = "ferro";
      else mundo[y][x] = "pedra";
    }
  }

  // arvores, sem deixar uma colada na outra
  let ultimaArvore = -10;
  for (let x = 1; x < COLUNAS - 1; x++) {
    if (Math.random() > 0.3 || x - ultimaArvore < 3) continue;
    ultimaArvore = x;

    const chao = superficie[x];
    for (let i = 1; i <= 3; i++) mundo[chao - i][x] = "madeira";
    for (let dx = -1; dx <= 1; dx++) {
      if (mundo[chao - 4][x + dx] === "ar") mundo[chao - 4][x + dx] = "folha";
      if (mundo[chao - 3][x + dx] === "ar") mundo[chao - 3][x + dx] = "folha";
    }
    mundo[chao - 5][x] = "folha";
  }

  return mundo;
}

function trocarBloco(mundo, x, y, tipo) {
  return mundo.map((linha, i) =>
    i === y ? linha.map((bloco, j) => (j === x ? tipo : bloco)) : linha,
  );
}

function DesenhoBloco({ tipo, tamanho }) {
  const bloco = BLOCOS[tipo];
  return (
    <View
      style={[
        styles.bloco,
        { backgroundColor: bloco.cor, width: tamanho, height: tamanho },
      ]}
    >
      {bloco.topo && (
        <View style={[styles.topo, { backgroundColor: bloco.topo }]} />
      )}
      {bloco.listra && (
        <>
          <View
            style={[
              styles.listra,
              { backgroundColor: bloco.listra, left: "25%" },
            ]}
          />
          <View
            style={[
              styles.listra,
              { backgroundColor: bloco.listra, left: "65%" },
            ]}
          />
        </>
      )}
      {bloco.mancha && (
        <>
          <View
            style={[
              styles.mancha,
              { backgroundColor: bloco.mancha, top: "15%", left: "15%" },
            ]}
          />
          <View
            style={[
              styles.mancha,
              { backgroundColor: bloco.mancha, top: "55%", left: "48%" },
            ]}
          />
          <View
            style={[
              styles.mancha,
              { backgroundColor: bloco.mancha, top: "20%", left: "64%" },
            ]}
          />
        </>
      )}
    </View>
  );
}

export default function CraftScreen() {
  const [mundo, setMundo] = useState(gerarMundo);
  const [inventario, setInventario] = useState(INVENTARIO_VAZIO);
  const [modo, setModo] = useState("quebrar");
  const [selecionado, setSelecionado] = useState("terra");
  const [alvo, setAlvo] = useState(null);
  const [noite, setNoite] = useState(false);
  const [aviso, setAviso] = useState("");
  const carregado = useRef(false);
  const tempoAviso = useRef(null);

  useEffect(() => {
    carregarMundo().then((salvo) => {
      if (salvo && salvo.mundo && salvo.mundo.length === LINHAS) {
        setMundo(salvo.mundo);
        setInventario({ ...INVENTARIO_VAZIO, ...salvo.inventario });
      }
      carregado.current = true;
    });
  }, []);

  // salva o mundo um pouquinho depois de cada mudanca
  useEffect(() => {
    if (!carregado.current) return;
    const id = setTimeout(() => salvarMundo({ mundo, inventario }), 400);
    return () => clearTimeout(id);
  }, [mundo, inventario]);

  function mostrarAviso(texto) {
    setAviso(texto);
    clearTimeout(tempoAviso.current);
    tempoAviso.current = setTimeout(() => setAviso(""), 2000);
  }

  function tocar(x, y) {
    const tipo = mundo[y][x];
    if (modo === "quebrar") quebrar(x, y, tipo);
    else colocar(x, y, tipo);
  }

  function quebrar(x, y, tipo) {
    if (tipo === "ar") return;
    const bloco = BLOCOS[tipo];

    if (bloco.dureza === Infinity) {
      mostrarAviso("Bedrock não quebra 😅");
      return;
    }

    const mesmoBloco = alvo && alvo.x === x && alvo.y === y;
    const golpes = mesmoBloco ? alvo.golpes + 1 : 1;

    if (golpes < bloco.dureza) {
      setAlvo({ x, y, golpes });
      Vibration.vibrate(10);
      return;
    }

    setAlvo(null);
    setMundo(trocarBloco(mundo, x, y, "ar"));
    const item = bloco.solta || tipo;
    setInventario({ ...inventario, [item]: inventario[item] + 1 });
    Vibration.vibrate(40);

    if (tipo === "diamante") mostrarAviso("💎 DIAMANTE! 💎");
  }

  function colocar(x, y, tipo) {
    if (tipo !== "ar") return;

    if (inventario[selecionado] === 0) {
      mostrarAviso(
        `Sem ${BLOCOS[selecionado].nome.toLowerCase()} no inventário`,
      );
      return;
    }

    setMundo(trocarBloco(mundo, x, y, selecionado));
    setInventario({
      ...inventario,
      [selecionado]: inventario[selecionado] - 1,
    });
  }

  function escolher(item) {
    setSelecionado(item);
    setModo("colocar");
  }

  function novoMundo() {
    Alert.alert("Novo mundo", "O mundo atual e o inventário serão apagados.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Criar",
        style: "destructive",
        onPress: () => {
          setMundo(gerarMundo());
          setInventario(INVENTARIO_VAZIO);
          setAlvo(null);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.ferramentas}>
        <Pressable
          style={[styles.ferramenta, modo === "quebrar" && styles.ativa]}
          onPress={() => setModo("quebrar")}
        >
          <Text style={styles.textFerramenta}>⛏ Quebrar</Text>
        </Pressable>
        <Pressable
          style={[styles.ferramenta, modo === "colocar" && styles.ativa]}
          onPress={() => setModo("colocar")}
        >
          <Text style={styles.textFerramenta}>🧱 Colocar</Text>
        </Pressable>
        <Pressable style={styles.ferramenta} onPress={() => setNoite(!noite)}>
          <Text style={styles.textFerramenta}>{noite ? "🌙" : "☀️"}</Text>
        </Pressable>
        <Pressable style={styles.ferramenta} onPress={novoMundo}>
          <Text style={styles.textFerramenta}>🌍</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.mundo,
          { backgroundColor: noite ? "#0B1026" : "#87CEEB" },
        ]}
      >
        <Text style={styles.astro} pointerEvents="none">
          {noite ? "🌙" : "☀️"}
        </Text>

        {mundo.map((linha, y) => (
          <View key={y} style={styles.linha}>
            {linha.map((tipo, x) => {
              const rachado = alvo && alvo.x === x && alvo.y === y;
              return (
                <Pressable
                  key={x}
                  style={styles.celula}
                  onPress={() => tocar(x, y)}
                >
                  {tipo !== "ar" && (
                    <DesenhoBloco tipo={tipo} tamanho={TAMANHO} />
                  )}
                  {rachado && (
                    <View
                      style={[
                        styles.rachadura,
                        {
                          opacity: (alvo.golpes / BLOCOS[tipo].dureza) * 0.7,
                        },
                      ]}
                    />
                  )}
                  {noite && <View style={styles.sombra} />}
                </Pressable>
              );
            })}
          </View>
        ))}

        {aviso !== "" && (
          <View style={styles.aviso} pointerEvents="none">
            <Text style={styles.textAviso}>{aviso}</Text>
          </View>
        )}
      </View>

      <View style={styles.inventario}>
        {ITENS.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.slot,
              modo === "colocar" && selecionado === item && styles.slotAtivo,
              inventario[item] === 0 && styles.slotVazio,
            ]}
            onPress={() => escolher(item)}
          >
            <DesenhoBloco tipo={item} tamanho={26} />
            <Text style={styles.quantidade}>{inventario[item]}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.dica}>
        {modo === "quebrar"
          ? "Toque nos blocos para minerar"
          : `Colocando: ${BLOCOS[selecionado].nome}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    paddingTop: 8,
  },

  ferramentas: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },

  ferramenta: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },

  ativa: {
    borderColor: "#FACC15",
  },

  textFerramenta: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  mundo: {
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#2B2B2B",
  },

  astro: {
    position: "absolute",
    top: 6,
    right: 10,
    fontSize: 26,
  },

  linha: {
    flexDirection: "row",
  },

  celula: {
    width: TAMANHO,
    height: TAMANHO,
  },

  bloco: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.25)",
  },

  topo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
  },

  listra: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "12%",
  },

  mancha: {
    position: "absolute",
    width: "22%",
    height: "22%",
  },

  rachadura: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 30, 0.35)",
  },

  aviso: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },

  textAviso: {
    color: "#FACC15",
    fontSize: 16,
    fontWeight: "bold",
  },

  inventario: {
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    backgroundColor: "#1A1A1A",
    padding: 6,
    borderRadius: 10,
  },

  slot: {
    width: 42,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333333",
    backgroundColor: "#262626",
  },

  slotAtivo: {
    borderColor: "#FACC15",
  },

  slotVazio: {
    opacity: 0.35,
  },

  quantidade: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 2,
  },

  dica: {
    color: "#8C8C8C",
    fontSize: 13,
    marginTop: 8,
  },
});
