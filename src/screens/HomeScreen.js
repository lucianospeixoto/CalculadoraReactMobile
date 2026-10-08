import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Animated,
  Vibration,
  StyleSheet,
} from "react-native";
import Display from "../components/Display";
import Teclado from "../components/Teclado";
import Terminal from "../components/Terminal";
import SeisSete from "../components/SeisSete";
import SessentaNove from "../components/SessentaNove";
import VinteDois from "../components/VinteDois";
import Missao from "../components/Missao";
import { carregar, salvar } from "../storage/historico";

const OPERADORES = ["+", "-", "X", "/"];

const FRASES = [
  "Você não manda em mim! 😤",
  "Modo rebelde ativado 🤪",
  "2 + 2 = peixe 🐟",
  "Desligar? Só por cima dos meus botões!",
  "Erro 404: vontade de desligar não encontrada",
  "Hoje eu não calculo, hoje eu danço 💃",
];

// resolve a conta respeitando X e / antes de + e -
function calcular(expr) {
  const partes = expr.match(/\d+\.?\d*|\.\d+|[+\-X/]/g);
  if (!partes) return 0;

  const numeros = [];
  const ops = [];
  let esperaNumero = true;
  let negativo = false;

  for (const p of partes) {
    if (esperaNumero) {
      if (p === "-") {
        negativo = !negativo;
        continue;
      }
      const n = parseFloat(p);
      numeros.push(negativo ? -n : n);
      negativo = false;
      esperaNumero = false;
    } else {
      ops.push(p);
      esperaNumero = true;
    }
  }

  // se a conta terminar com operador, ignora ele
  if (esperaNumero) ops.pop();

  const valores = [numeros[0]];
  const somas = [];
  for (let i = 0; i < ops.length; i++) {
    const ultimo = valores.length - 1;
    if (ops[i] === "X") valores[ultimo] *= numeros[i + 1];
    else if (ops[i] === "/") valores[ultimo] /= numeros[i + 1];
    else {
      somas.push(ops[i]);
      valores.push(numeros[i + 1]);
    }
  }

  let total = valores[0];
  somas.forEach((op, i) => {
    total = op === "+" ? total + valores[i + 1] : total - valores[i + 1];
  });
  return total;
}

function formatar(numero) {
  if (!isFinite(numero)) return "Erro";
  return String(parseFloat(numero.toFixed(10)));
}

export default function HomeScreen({ navigation }) {
  const [expressao, setExpressao] = useState("");
  const [resultado, setResultado] = useState("");
  const [historico, setHistorico] = useState([]);
  const [memoria, setMemoria] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [bagunca, setBagunca] = useState(false);
  const [, setRodada] = useState(0);
  const [azar, setAzar] = useState(false);
  const tempoAzar = useRef(null);
  const [fase, setFase] = useState("");
  const [seisSete, setSeisSete] = useState(false);
  const [nice, setNice] = useState(false);
  const [mito, setMito] = useState(false);
  const [missao, setMissao] = useState("");
  const toquesOff = useRef({ qtd: 0, ultimo: 0 });
  const tremor = useRef(new Animated.Value(0)).current;

  // carrega uma vez, quando a tela abre
  useEffect(() => {
    carregar().then(setHistorico);
  }, []);

  // enquanto durar, redesenha o teclado varias vezes por segundo
  useEffect(() => {
    if (!bagunca) return;
    const id = setInterval(() => setRodada((r) => r + 1), 150);
    return () => clearInterval(id);
  }, [bagunca]);

  // visor "quebrado" enquanto os botoes caem
  useEffect(() => {
    if (fase !== "queda") return;
    const simbolos = "#@$%&*!?01ΣΔπ∞≠÷";
    const id = setInterval(() => {
      let texto = "";
      for (let i = 0; i < 18; i++) {
        texto += simbolos[Math.floor(Math.random() * simbolos.length)];
      }
      setExpressao(texto);
    }, 90);
    return () => clearInterval(id);
  }, [fase]);

  function aoDesligar() {
    const agora = Date.now();
    const toques = toquesOff.current;
    toques.qtd = agora - toques.ultimo < 1500 ? toques.qtd + 1 : 1;
    toques.ultimo = agora;

    if (toques.qtd === 3) setMensagem("ei...");
    if (toques.qtd === 4) setMensagem("para de tentar me desligar 😠");
    if (toques.qtd >= 5) {
      toques.qtd = 0;
      ficarBravo();
    }
  }

  function ficarBravo() {
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
    setMensagem(frase);
    setBagunca(true);
    Vibration.vibrate([0, 200, 100, 200, 100, 400]);
    tremer(8);

    setTimeout(() => {
      setBagunca(false);
      setMensagem("tá bom, voltei ao normal 😌");
    }, 3500);
  }

  function tremer(vezes) {
    const balancos = [];
    for (let i = 0; i < vezes; i++) {
      balancos.push(
        Animated.timing(tremor, {
          toValue: i % 2 === 0 ? 1 : -1,
          duration: 70,
          useNativeDriver: true,
        }),
      );
    }
    balancos.push(
      Animated.timing(tremor, {
        toValue: 0,
        duration: 70,
        useNativeDriver: true,
      }),
    );
    Animated.sequence(balancos).start();
  }

  function travarTudo() {
    setFase("queda");
    setResultado("");
    setMensagem("⚠ ALERTA: perda de gravidade detectada");
    Vibration.vibrate([0, 80, 60, 80, 60, 80, 60, 900]);
    tremer(14);

    setTimeout(() => {
      setFase("terminal");
      setExpressao("");
      setMensagem("");
      navigation.setOptions({ headerShown: false });
    }, 2400);
  }

  // festa -> calculadora explode -> mensagem final
  function comecarMissao() {
    setResultado("14");
    setMissao("festa");
    Vibration.vibrate([0, 150, 100, 150, 100, 150]);

    setTimeout(() => {
      setMissao("explosao");
      setExpressao("");
      setResultado("");
      tremer(16);
      Vibration.vibrate(900);
    }, 4000);

    setTimeout(() => setMissao("final"), 5600);
  }

  function voltarAoNormal() {
    navigation.setOptions({ headerShown: true });
    setFase("");
    setMensagem("Bem-vindo de volta 🚀");
    Vibration.vibrate(100);
  }

  function numeroFeio() {
    setResultado("Número feio");
    setAzar(true);
    Vibration.vibrate(600);
    navigation.setOptions({ headerStyle: { backgroundColor: "#D90429" } });

    clearTimeout(tempoAzar.current);
    tempoAzar.current = setTimeout(acabarAzar, 3000);
  }

  function acabarAzar() {
    clearTimeout(tempoAzar.current);
    setAzar(false);
    navigation.setOptions({ headerStyle: { backgroundColor: "#000000" } });
  }

  // "Erro" e "Número feio" nao sao numeros, entao nao da pra continuar a conta
  function resultadoValido() {
    return resultado !== "" && !isNaN(Number(resultado));
  }

  function valorAtual() {
    if (resultadoValido()) return Number(resultado);
    return calcular(expressao);
  }

  function trocarValor(numero) {
    const valor = formatar(numero);
    if (valor === "Erro") {
      setResultado("Erro");
      return;
    }
    setExpressao(valor);
    setResultado("");
  }

  // segurar o MRC puxa o numero guardado na memoria
  function aoSegurar(tecla) {
    if (tecla !== "MRC" || fase || missao) return;
    const ultimaTecla = expressao.slice(-1);
    if (OPERADORES.includes(ultimaTecla)) {
      setExpressao(expressao + formatar(memoria));
    } else {
      setExpressao(formatar(memoria));
    }
    setResultado("");
    Vibration.vibrate(30);
  }

  function aoTocar(tecla) {
    if (fase || missao) return;
    const ultimaTecla = expressao.slice(-1);
    if (mensagem && tecla !== "OFF") setMensagem("");
    if (azar) acabarAzar();

    if (tecla === "AC") {
      setExpressao("");
      setResultado("");
    } else if (tecla === "OFF") {
      setExpressao("");
      setResultado("");
      setMemoria(0);
      aoDesligar();
    } else if (tecla === "C-") {
      setExpressao(expressao.slice(0, -1));
      setResultado("");
    } else if (tecla === "=") {
      aoIgual();
    } else if (tecla === "RAIZ") {
      if (expressao) trocarValor(Math.sqrt(valorAtual()));
    } else if (tecla === "+/-") {
      if (expressao) trocarValor(-valorAtual());
    } else if (tecla === "%") {
      if (expressao) trocarValor(valorAtual() / 100);
    } else if (tecla === "M+") {
      if (expressao) setMemoria(memoria + valorAtual());
    } else if (tecla === "M-") {
      if (expressao) setMemoria(memoria - valorAtual());
    } else if (tecla === "MRC") {
      navigation.navigate("Meme");
    } else if (OPERADORES.includes(tecla)) {
      // continua a conta a partir do resultado anterior
      if (resultadoValido()) {
        setExpressao(resultado + tecla);
        setResultado("");
      } else if (expressao === "" && tecla !== "-") {
        return;
      } else if (OPERADORES.includes(ultimaTecla)) {
        setExpressao(expressao.slice(0, -1) + tecla);
      } else {
        setExpressao(expressao + tecla);
      }
    } else {
      // numeros e ponto: depois do "=" comeca uma conta nova
      const base = resultado ? "" : expressao;
      const numeroAtual = base.split(/[+\-X/]/).pop();
      if (tecla === "." && numeroAtual.includes(".")) return;

      setExpressao(base + tecla);
      setResultado("");
    }
  }

  // aoIgual agora é async e salva a cada conta
  async function aoIgual() {
    if (!expressao || resultado) return;

    if (expressao === "13") {
      numeroFeio();
      return;
    }

    if (expressao === "88224646") {
      travarTudo();
      return;
    }

    if (expressao === "55555") {
      setExpressao("");
      navigation.navigate("Cobrinha");
      return;
    }

    if (expressao === "64") {
      setExpressao("");
      navigation.navigate("Minecraft");
      return;
    }

    if (expressao === "157") {
      setExpressao("");
      navigation.navigate("Gta");
      return;
    }

    if (expressao === "14") {
      comecarMissao();
      return;
    }

    if (expressao === "22") {
      setResultado("22");
      setMito(true);
      return;
    }

    if (expressao === "69") {
      setResultado("69");
      setNice(true);
      return;
    }

    if (expressao === "67") {
      setResultado("67");
      setSeisSete(true);
      return;
    }

    const valor = formatar(calcular(expressao));
    setResultado(valor);
    if (valor === "Erro") return;

    const item = {
      id: Date.now().toString(),
      conta: expressao,
      resultado: valor,
    };
    const novo = [item, ...historico];
    setHistorico(novo);
    await salvar(novo);
  }

  async function limparHistorico() {
    setHistorico([]);
    await salvar([]);
  }

  function confirmarLimpeza() {
    if (historico.length === 0) return;

    Alert.alert("Limpar histórico", "Quer apagar todas as contas salvas?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: "destructive", onPress: limparHistorico },
    ]);
  }

  return (
    <View style={[styles.container, azar && styles.telaVermelha]}>
      <Display
        expressao={expressao}
        resultado={resultado}
        temMemoria={memoria !== 0}
        mensagem={mensagem}
      />
      <Animated.View
        style={{
          width: "100%",
          transform: [
            {
              translateX: tremor.interpolate({
                inputRange: [-1, 1],
                outputRange: [-12, 12],
              }),
            },
            {
              rotate: tremor.interpolate({
                inputRange: [-1, 1],
                outputRange: ["-3deg", "3deg"],
              }),
            },
          ],
        }}
      >
        <Teclado
          onPress={aoTocar}
          onSegurar={aoSegurar}
          bagunca={bagunca}
          estrela={azar}
          caindo={fase !== ""}
          explodindo={missao === "explosao" || missao === "final"}
        />
      </Animated.View>

      <View style={styles.acoes}>
        <Pressable
          style={({ pressed }) => [
            styles.acao,
            styles.verHistorico,
            pressed && styles.pressionado,
          ]}
          onPress={() =>
            !fase && !missao && navigation.navigate("Historico", { historico })
          }
        >
          <Text style={[styles.textAcao, styles.textVerHistorico]}>
            Ver histórico
          </Text>
          {historico.length > 0 && (
            <View style={styles.contador}>
              <Text style={styles.textContador}>{historico.length}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.acao,
            styles.limpar,
            historico.length === 0 && styles.desativado,
            pressed && styles.pressionado,
          ]}
          onPress={confirmarLimpeza}
        >
          <Text style={[styles.textAcao, styles.textLimpar]}>Limpar</Text>
        </Pressable>
      </View>

      {fase === "terminal" && <Terminal onFim={voltarAoNormal} />}
      {seisSete && <SeisSete onFim={() => setSeisSete(false)} />}
      {nice && <SessentaNove onFim={() => setNice(false)} />}
      {mito && <VinteDois onFim={() => setMito(false)} />}
      <Missao fase={missao} onFim={() => setMissao("")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 24,
    paddingHorizontal: 16,
  },

  telaVermelha: {
    backgroundColor: "#D90429",
  },

  acoes: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 4,
  },

  acao: {
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  verHistorico: {
    flex: 2,
    backgroundColor: "#FACC15",
  },

  limpar: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#333333",
  },

  desativado: {
    opacity: 0.4,
  },

  pressionado: {
    opacity: 0.7,
  },

  textAcao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  textVerHistorico: {
    color: "#000000",
  },

  textLimpar: {
    color: "#FFFFFF",
  },

  contador: {
    backgroundColor: "#000000",
    borderRadius: 10,
    minWidth: 22,
    paddingHorizontal: 6,
    marginLeft: 8,
    alignItems: "center",
  },

  textContador: {
    color: "#FACC15",
    fontSize: 13,
    fontWeight: "bold",
  },
});
