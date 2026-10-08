import { useState, useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  Pressable,
  PanResponder,
  Dimensions,
  Platform,
  Vibration,
  StyleSheet,
} from "react-native";

// ---------- mapa da cidade ----------

const LARGURA = Math.min(Dimensions.get("window").width, 420);
const ALTURA = Math.round(LARGURA * 1.05);
const RUA = 36;
const CALCADA = 12;
const RUAS_H = [Math.round(ALTURA * 0.3), Math.round(ALTURA * 0.7)];
const RUAS_V = [Math.round(LARGURA * 0.3), Math.round(LARGURA * 0.7)];

const VEL_PE = 2.4;
const VEL_CARRO = 5;

const CORES_PREDIO = ["#5D4037", "#455A64", "#6D4C41", "#37474F", "#4E342E"];
const CORES_CARRO = ["#E53935", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA"];
const ROSTOS = ["🧑", "👩", "👴", "👱", "🧔", "👵"];

// os predios ficam nos quarteiroes entre as ruas
function montarPredios() {
  const faixasX = [
    [0, RUAS_V[0] - RUA / 2],
    [RUAS_V[0] + RUA / 2, RUAS_V[1] - RUA / 2],
    [RUAS_V[1] + RUA / 2, LARGURA],
  ];
  const faixasY = [
    [0, RUAS_H[0] - RUA / 2],
    [RUAS_H[0] + RUA / 2, RUAS_H[1] - RUA / 2],
    [RUAS_H[1] + RUA / 2, ALTURA],
  ];

  const predios = [];
  faixasY.forEach(([y0, y1], linha) => {
    faixasX.forEach(([x0, x1], coluna) => {
      predios.push({
        x: x0 + CALCADA,
        y: y0 + CALCADA,
        w: x1 - x0 - CALCADA * 2,
        h: y1 - y0 - CALCADA * 2,
        cor: CORES_PREDIO[(linha * 3 + coluna) % CORES_PREDIO.length],
        loja: linha === 1 && coluna === 0,
      });
    });
  });
  return predios;
}

const PREDIOS = montarPredios();
const LOJA = PREDIOS.find((p) => p.loja);

// ---------- funcoes de apoio ----------

let contador = 0;
function novoId() {
  contador++;
  return contador;
}

function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function perto(a, b, distancia) {
  return Math.hypot(a.x - b.x, a.y - b.y) < distancia;
}

function bateNoPredio(x, y, raio) {
  return PREDIOS.some(
    (p) =>
      x + raio > p.x &&
      x - raio < p.x + p.w &&
      y + raio > p.y &&
      y - raio < p.y + p.h,
  );
}

// anda separado em x e em y, assim da pra "deslizar" na parede
function mover(ent, dx, dy, raio) {
  const nx = Math.max(raio, Math.min(LARGURA - raio, ent.x + dx));
  if (!bateNoPredio(nx, ent.y, raio)) ent.x = nx;
  const ny = Math.max(raio, Math.min(ALTURA - raio, ent.y + dy));
  if (!bateNoPredio(ent.x, ny, raio)) ent.y = ny;
}

function pontoNaRua() {
  while (true) {
    const desvio = (Math.random() * 2 - 1) * (RUA / 2 + CALCADA - 6);
    const ponto =
      Math.random() < 0.5
        ? { x: Math.random() * LARGURA, y: sortear(RUAS_H) + desvio }
        : { x: sortear(RUAS_V) + desvio, y: Math.random() * ALTURA };
    if (!bateNoPredio(ponto.x, ponto.y, 9)) return ponto;
  }
}

function pontoNaBorda() {
  if (Math.random() < 0.5) {
    return { x: Math.random() < 0.5 ? 10 : LARGURA - 10, y: sortear(RUAS_H) };
  }
  return { x: sortear(RUAS_V), y: Math.random() < 0.5 ? 10 : ALTURA - 10 };
}

function sortearDirecao(npc) {
  const angulo = Math.random() * Math.PI * 2;
  npc.vx = Math.cos(angulo);
  npc.vy = Math.sin(angulo);
}

function criarNpc(ponto = pontoNaRua()) {
  const npc = {
    id: novoId(),
    x: ponto.x,
    y: ponto.y,
    rosto: sortear(ROSTOS),
    vivo: true,
    tempoMorto: 0,
  };
  sortearDirecao(npc);
  return npc;
}

function carroNaRua(eixo, indice, sentido, motorista, posicao = Math.random()) {
  const carro = { id: novoId(), cor: sortear(CORES_CARRO), motorista };
  if (eixo === "h") {
    carro.x = posicao * LARGURA;
    carro.y = RUAS_H[indice] + sentido * 9;
    carro.angulo = sentido > 0 ? 0 : Math.PI;
  } else {
    carro.x = RUAS_V[indice] - sentido * 9;
    carro.y = posicao * ALTURA;
    carro.angulo = sentido > 0 ? Math.PI / 2 : -Math.PI / 2;
  }
  return carro;
}

function jogoNovo() {
  const jogo = {
    tick: 0,
    jogador: {
      x: RUAS_V[0],
      y: RUAS_H[0],
      angulo: 0,
      carro: null,
      recarga: 0,
      andando: false,
    },
    npcs: [],
    carros: [
      carroNaRua("h", 0, 1, true),
      carroNaRua("h", 1, -1, true),
      carroNaRua("v", 0, 1, true),
      carroNaRua("v", 1, -1, true),
      carroNaRua("h", 1, 1, false, 0.12),
      carroNaRua("v", 1, 1, false, 0.15),
    ],
    policiais: [],
    tiros: [],
    itens: [],
    dinheiro: 0,
    estrelas: 0,
    vida: 100,
    ultimoCrime: 0,
    ultimoAssalto: -1000,
    panico: 0,
    fim: null,
  };
  for (let i = 0; i < 8; i++) jogo.npcs.push(criarNpc());
  return jogo;
}

function crime(jogo, gravidade) {
  jogo.estrelas = Math.min(5, jogo.estrelas + gravidade);
  jogo.ultimoCrime = jogo.tick;
  jogo.panico = 120;
}

function matarNpc(jogo, npc) {
  npc.vivo = false;
  npc.tempoMorto = 0;
  if (Math.random() < 0.7) {
    jogo.itens.push({
      id: novoId(),
      x: npc.x,
      y: npc.y,
      valor: 10 + Math.floor(Math.random() * 70),
    });
  }
}

function carroDoJogador(jogo) {
  return jogo.carros.find((k) => k.id === jogo.jogador.carro);
}

function pertoDaLoja(j) {
  return (
    j.x > LOJA.x - 22 &&
    j.x < LOJA.x + LOJA.w + 22 &&
    j.y > LOJA.y - 22 &&
    j.y < LOJA.y + LOJA.h + 22
  );
}

// o que o botao de acao vai fazer agora
function acaoDisponivel(jogo) {
  const j = jogo.jogador;
  if (j.carro) return "sair";
  if (jogo.carros.some((k) => perto(k, j, 28))) return "carro";
  if (pertoDaLoja(j)) return "loja";
  return null;
}

// ---------- loop do jogo ----------

function atualizar(jogo, controles, avisar) {
  jogo.tick++;
  const j = jogo.jogador;
  const carro = carroDoJogador(jogo);
  const dir = controles.dir;
  const forca = Math.min(1, Math.hypot(dir.x, dir.y));

  // jogador
  j.andando = forca > 0.2;
  if (j.andando) {
    j.angulo = Math.atan2(dir.y, dir.x);
    const cos = Math.cos(j.angulo);
    const sin = Math.sin(j.angulo);
    if (carro) {
      carro.angulo = j.angulo;
      mover(carro, cos * VEL_CARRO * forca, sin * VEL_CARRO * forca, 12);
      j.x = carro.x;
      j.y = carro.y;
    } else {
      mover(j, cos * VEL_PE * forca, sin * VEL_PE * forca, 9);
    }
  }

  // atirar
  if (j.recarga > 0) j.recarga--;
  if (controles.atirando && j.recarga === 0) {
    j.recarga = 6;
    jogo.panico = 120;
    jogo.tiros.push({
      id: novoId(),
      x: j.x + Math.cos(j.angulo) * 14,
      y: j.y + Math.sin(j.angulo) * 14,
      vx: Math.cos(j.angulo) * 9,
      vy: Math.sin(j.angulo) * 9,
      vida: 40,
      doJogador: true,
    });
  }

  // tiros
  jogo.tiros.forEach((t) => {
    t.x += t.vx;
    t.y += t.vy;
    t.vida--;
    const saiu = t.x < 0 || t.x > LARGURA || t.y < 0 || t.y > ALTURA;
    if (saiu || bateNoPredio(t.x, t.y, 1)) t.vida = 0;
    if (t.vida <= 0) return;

    if (t.doJogador) {
      const npc = jogo.npcs.find((n) => n.vivo && perto(n, t, 11));
      if (npc) {
        matarNpc(jogo, npc);
        crime(jogo, 1);
        t.vida = 0;
        return;
      }
      const policial = jogo.policiais.find((p) => perto(p, t, 11));
      if (policial) {
        jogo.policiais = jogo.policiais.filter((p) => p !== policial);
        jogo.itens.push({
          id: novoId(),
          x: policial.x,
          y: policial.y,
          valor: 100,
        });
        crime(jogo, 2);
        avisar("👮 Policial derrubado!");
        t.vida = 0;
      }
    } else if (perto(j, t, 12)) {
      jogo.vida -= carro ? 8 : 15;
      t.vida = 0;
      Vibration.vibrate(60);
      if (jogo.vida <= 0) {
        jogo.vida = 0;
        jogo.fim = "wasted";
      }
    }
  });
  jogo.tiros = jogo.tiros.filter((t) => t.vida > 0);

  // pedestres
  if (jogo.panico > 0) jogo.panico--;
  const velNpc = jogo.panico > 0 ? 2.2 : 0.8;
  jogo.npcs.forEach((n) => {
    if (!n.vivo) {
      n.tempoMorto++;
      return;
    }
    if (Math.random() < 0.02) sortearDirecao(n);
    const antes = { x: n.x, y: n.y };
    mover(n, n.vx * velNpc, n.vy * velNpc, 8);
    if (n.x === antes.x && n.y === antes.y) sortearDirecao(n);

    if (carro && j.andando && perto(n, carro, 17)) {
      matarNpc(jogo, n);
      crime(jogo, 1);
      Vibration.vibrate(40);
    }
  });
  jogo.npcs = jogo.npcs.filter((n) => n.vivo || n.tempoMorto < 125);
  if (jogo.npcs.filter((n) => n.vivo).length < 8 && jogo.tick % 25 === 0) {
    jogo.npcs.push(criarNpc(pontoNaBorda()));
  }

  // transito
  jogo.carros.forEach((k) => {
    if (!k.motorista || k.id === j.carro) return;
    k.x += Math.cos(k.angulo) * 2;
    k.y += Math.sin(k.angulo) * 2;
    if (k.x > LARGURA + 25) k.x = -25;
    if (k.x < -25) k.x = LARGURA + 25;
    if (k.y > ALTURA + 25) k.y = -25;
    if (k.y < -25) k.y = ALTURA + 25;
  });

  // pegar dinheiro do chao
  jogo.itens = jogo.itens.filter((item) => {
    if (perto(item, j, 18)) {
      jogo.dinheiro += item.valor;
      avisar(`+ $${item.valor}`);
      return false;
    }
    return true;
  });

  // policia
  const alvo = Math.min(7, Math.ceil(jogo.estrelas * 1.5));
  if (jogo.tick % 40 === 0) {
    if (jogo.policiais.length < alvo) {
      const ponto = pontoNaBorda();
      jogo.policiais.push({ id: novoId(), x: ponto.x, y: ponto.y });
    } else if (jogo.policiais.length > alvo) {
      jogo.policiais.pop();
    }
  }

  const velPolicia = Math.min(3.2, 1.5 + jogo.estrelas * 0.35);
  jogo.policiais.forEach((p) => {
    const ang = Math.atan2(j.y - p.y, j.x - p.x);
    mover(p, Math.cos(ang) * velPolicia, Math.sin(ang) * velPolicia, 8);

    if (jogo.estrelas >= 3 && Math.random() < 0.012) {
      jogo.tiros.push({
        id: novoId(),
        x: p.x,
        y: p.y,
        vx: Math.cos(ang) * 6,
        vy: Math.sin(ang) * 6,
        vida: 60,
        doJogador: false,
      });
    }

    if (perto(p, j, 15) && (!carro || !j.andando)) jogo.fim = "busted";
  });

  // as estrelas vao baixando se ficar um tempo sem fazer besteira
  if (jogo.estrelas > 0 && jogo.tick - jogo.ultimoCrime > 300) {
    jogo.estrelas--;
    jogo.ultimoCrime = jogo.tick;
  }

  if (jogo.fim) Vibration.vibrate(700);
}

function fazerAcao(jogo, avisar) {
  const j = jogo.jogador;
  const acao = acaoDisponivel(jogo);

  if (acao === "sair") {
    j.carro = null;
    return;
  }

  if (acao === "carro") {
    const carro = jogo.carros.find((k) => perto(k, j, 28));
    if (carro.motorista) {
      carro.motorista = false;
      jogo.npcs.push(criarNpc({ x: carro.x, y: carro.y }));
      crime(jogo, 1);
      avisar("🚗 Carro roubado!");
    }
    j.carro = carro.id;
    j.x = carro.x;
    j.y = carro.y;
    return;
  }

  if (acao === "loja") {
    if (jogo.tick - jogo.ultimoAssalto < 500) {
      avisar("O caixa ainda está vazio...");
      return;
    }
    const valor = 300 + Math.floor(Math.random() * 500);
    jogo.dinheiro += valor;
    jogo.ultimoAssalto = jogo.tick;
    crime(jogo, 3);
    avisar(`💰 Assalto! + $${valor}`);
    Vibration.vibrate(100);
  }
}

// ---------- desenho ----------

// a cidade nao muda, entao desenha uma vez so
const Cidade = memo(function Cidade() {
  const faixas = [];
  for (let x = 6; x < LARGURA; x += 28) {
    RUAS_H.forEach((y) =>
      faixas.push({ left: x, top: y - 1, width: 14, height: 2 }),
    );
  }
  for (let y = 6; y < ALTURA; y += 28) {
    RUAS_V.forEach((x) =>
      faixas.push({ left: x - 1, top: y, width: 2, height: 14 }),
    );
  }

  return (
    <>
      {RUAS_H.map((y) => (
        <View
          key={"h" + y}
          style={[
            styles.rua,
            { left: 0, top: y - RUA / 2, width: LARGURA, height: RUA },
          ]}
        />
      ))}
      {RUAS_V.map((x) => (
        <View
          key={"v" + x}
          style={[
            styles.rua,
            { left: x - RUA / 2, top: 0, width: RUA, height: ALTURA },
          ]}
        />
      ))}
      {faixas.map((f, i) => (
        <View key={i} style={[styles.faixa, f]} />
      ))}
      {PREDIOS.map((p, i) => (
        <View
          key={i}
          style={[
            styles.predio,
            {
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              backgroundColor: p.loja ? "#1B5E20" : p.cor,
            },
          ]}
        >
          {p.loja && <Text style={styles.placaLoja}>🏪 LOJA</Text>}
        </View>
      ))}
    </>
  );
});

function Carro({ carro, meu }) {
  return (
    <View
      style={[
        styles.carro,
        {
          left: carro.x - 17,
          top: carro.y - 9,
          backgroundColor: carro.cor,
          transform: [{ rotate: carro.angulo + "rad" }],
        },
        meu && styles.meuCarro,
      ]}
    >
      <View style={styles.parabrisa} />
    </View>
  );
}

export default function GtaScreen() {
  const jogo = useRef(null);
  if (!jogo.current) jogo.current = jogoNovo();
  const controles = useRef({ dir: { x: 0, y: 0 }, atirando: false });
  const [, setQuadro] = useState(0);
  const [aviso, setAviso] = useState("");
  const tempoAviso = useRef(null);

  function avisar(texto) {
    setAviso(texto);
    clearTimeout(tempoAviso.current);
    tempoAviso.current = setTimeout(() => setAviso(""), 1800);
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (jogo.current.fim) return;
      atualizar(jogo.current, controles.current, avisar);
      setQuadro((q) => q + 1);
    }, 40);
    return () => {
      clearInterval(id);
      clearTimeout(tempoAviso.current);
    };
  }, []);

  // no navegador: W A S D ou setas, espaco atira, E faz a acao
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const apertadas = {};

    function atualizarDirecao() {
      const x =
        (apertadas.d || apertadas.arrowright ? 1 : 0) -
        (apertadas.a || apertadas.arrowleft ? 1 : 0);
      const y =
        (apertadas.s || apertadas.arrowdown ? 1 : 0) -
        (apertadas.w || apertadas.arrowup ? 1 : 0);
      controles.current.dir = { x, y };
    }

    function baixo(e) {
      const tecla = e.key.toLowerCase();
      if (tecla === " ") controles.current.atirando = true;
      else if (tecla === "e" && !apertadas.e) fazerAcao(jogo.current, avisar);
      apertadas[tecla] = true;
      atualizarDirecao();
      if (tecla === " " || tecla.startsWith("arrow")) e.preventDefault();
    }

    function cima(e) {
      const tecla = e.key.toLowerCase();
      if (tecla === " ") controles.current.atirando = false;
      apertadas[tecla] = false;
      atualizarDirecao();
    }

    window.addEventListener("keydown", baixo);
    window.addEventListener("keyup", cima);
    return () => {
      window.removeEventListener("keydown", baixo);
      window.removeEventListener("keyup", cima);
    };
  }, []);

  const joystick = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, g) => {
        const maximo = 40;
        let x = g.dx;
        let y = g.dy;
        const distancia = Math.hypot(x, y);
        if (distancia > maximo) {
          x = (x / distancia) * maximo;
          y = (y / distancia) * maximo;
        }
        controles.current.dir = { x: x / maximo, y: y / maximo };
      },
      onPanResponderRelease: () => {
        controles.current.dir = { x: 0, y: 0 };
      },
      onPanResponderTerminate: () => {
        controles.current.dir = { x: 0, y: 0 };
      },
    }),
  ).current;

  function recomecar() {
    jogo.current = jogoNovo();
    setQuadro((q) => q + 1);
  }

  const g = jogo.current;
  const j = g.jogador;
  const acao = acaoDisponivel(g);
  const textoAcao = {
    sair: "🚪 Sair",
    carro: "🚗 Pegar carro",
    loja: "💰 Assaltar",
  }[acao];

  return (
    <View style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.dinheiro}>
          $ {String(g.dinheiro).padStart(6, "0")}
        </Text>
        <View style={styles.vida}>
          <View style={[styles.vidaCheia, { width: `${g.vida}%` }]} />
        </View>
        <Text style={styles.estrelas}>
          {"★".repeat(g.estrelas)}
          <Text style={styles.estrelaApagada}>
            {"★".repeat(5 - g.estrelas)}
          </Text>
        </Text>
      </View>

      <View style={styles.arena}>
        <Cidade />

        {g.itens.map((item) => (
          <Text
            key={item.id}
            style={[styles.emoji, { left: item.x - 10, top: item.y - 12 }]}
          >
            💵
          </Text>
        ))}

        {g.npcs.map((n) => (
          <Text
            key={n.id}
            style={[
              styles.emoji,
              { left: n.x - 10, top: n.y - 12 },
              !n.vivo && styles.caido,
            ]}
          >
            {n.vivo ? n.rosto : "😵"}
          </Text>
        ))}

        {g.carros.map((k) => (
          <Carro key={k.id} carro={k} meu={k.id === j.carro} />
        ))}

        {g.policiais.map((p) => (
          <Text
            key={p.id}
            style={[styles.emoji, { left: p.x - 10, top: p.y - 12 }]}
          >
            👮
          </Text>
        ))}

        {!j.carro && (
          <Text
            style={[
              styles.emoji,
              styles.jogador,
              { left: j.x - 11, top: j.y - 13 },
            ]}
          >
            😎
          </Text>
        )}

        {g.tiros.map((t) => (
          <View
            key={t.id}
            style={[
              styles.tiro,
              { left: t.x - 2, top: t.y - 2 },
              !t.doJogador && styles.tiroPolicia,
            ]}
          />
        ))}

        {aviso !== "" && (
          <View style={styles.aviso} pointerEvents="none">
            <Text style={styles.textAviso}>{aviso}</Text>
          </View>
        )}

        {g.fim && (
          <View style={styles.fim}>
            <Text style={[styles.textFim, g.fim === "busted" && styles.busted]}>
              {g.fim === "busted" ? "BUSTED" : "WASTED"}
            </Text>
            <Text style={styles.textFimMenor}>Você juntou $ {g.dinheiro}</Text>
            <Pressable style={styles.denovo} onPress={recomecar}>
              <Text style={styles.textDenovo}>Jogar de novo</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.controles}>
        <View style={styles.joystick} {...joystick.panHandlers}>
          <View
            style={[
              styles.manche,
              {
                transform: [
                  { translateX: controles.current.dir.x * 40 },
                  { translateY: controles.current.dir.y * 40 },
                ],
              },
            ]}
          />
        </View>

        <View style={styles.botoes}>
          <Pressable
            style={[styles.botaoAcao, !acao && styles.desligado]}
            onPress={() => fazerAcao(g, avisar)}
          >
            <Text style={styles.textAcao}>{textoAcao || "—"}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.botaoTiro,
              pressed && styles.apertado,
            ]}
            onPressIn={() => (controles.current.atirando = true)}
            onPressOut={() => (controles.current.atirando = false)}
          >
            <Text style={styles.textTiro}>🔫</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
  },

  hud: {
    width: LARGURA,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  dinheiro: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  vida: {
    width: 80,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333333",
    overflow: "hidden",
  },

  vidaCheia: {
    height: "100%",
    backgroundColor: "#E53935",
  },

  estrelas: {
    color: "#FACC15",
    fontSize: 20,
  },

  estrelaApagada: {
    color: "#333333",
  },

  arena: {
    width: LARGURA,
    height: ALTURA,
    backgroundColor: "#8A8A8A",
    overflow: "hidden",
  },

  rua: {
    position: "absolute",
    backgroundColor: "#2B2B2B",
  },

  faixa: {
    position: "absolute",
    backgroundColor: "#FACC15",
    opacity: 0.7,
  },

  predio: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  placaLoja: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  emoji: {
    position: "absolute",
    fontSize: 18,
  },

  jogador: {
    fontSize: 20,
  },

  caido: {
    opacity: 0.7,
    transform: [{ rotate: "90deg" }],
  },

  carro: {
    position: "absolute",
    width: 34,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.5)",
  },

  meuCarro: {
    borderWidth: 2,
    borderColor: "#FACC15",
  },

  parabrisa: {
    position: "absolute",
    right: 5,
    top: 2,
    width: 6,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#BFE3FF",
  },

  tiro: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FACC15",
  },

  tiroPolicia: {
    backgroundColor: "#4DD2FF",
  },

  aviso: {
    position: "absolute",
    top: 10,
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

  fim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  textFim: {
    color: "#E53935",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 4,
  },

  busted: {
    color: "#4DD2FF",
  },

  textFimMenor: {
    color: "#FFFFFF",
    fontSize: 16,
    marginVertical: 12,
  },

  denovo: {
    backgroundColor: "#FACC15",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },

  textDenovo: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "bold",
  },

  controles: {
    width: LARGURA,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  joystick: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  manche: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FACC15",
  },

  botoes: {
    alignItems: "center",
    gap: 10,
  },

  botaoAcao: {
    minWidth: 130,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#262626",
    borderWidth: 1,
    borderColor: "#FACC15",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  desligado: {
    opacity: 0.35,
  },

  textAcao: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  botaoTiro: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
  },

  textTiro: {
    fontSize: 34,
  },

  apertado: {
    opacity: 0.7,
  },
});
