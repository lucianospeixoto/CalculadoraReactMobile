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
import { carregar, limpar, salvar } from "../storage/historico";

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

export default function HomeScreen({ navigation, route }) {
  const [expressao, setExpressao] = useState("");
  const [resultado, setResultado] = useState("");
  const [historico, setHistorico] = useState([]);
  const [memoria, setMemoria] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [bagunca, setBagunca] = useState(false);
  const [, setRodada] = useState(0);
  const toquesOff = useRef({ qtd: 0, ultimo: 0 });
  const tremor = useRef(new Animated.Value(0)).current;

  // atualiza a lista depois de voltar do histórico
  useEffect(() => {
    const atualizarHistorico = () => {
      carregar().then(setHistorico);
    };
    const unsubscribe = navigation.addListener("focus", atualizarHistorico);
    return unsubscribe;
  }, [navigation]);

  // recebe o resultado selecionado no histórico
  useEffect(() => {
    const valor = route.params?.valor;
    if (valor === undefined) return;

    setExpressao(route.params?.conta ?? String(valor));
    setResultado(String(valor));
  }, [route.params?.valor, route.params?.reutilizacaoId]);

  // enquanto durar, redesenha o teclado varias vezes por segundo
  useEffect(() => {
    if (!bagunca) return;
    const id = setInterval(() => setRodada((r) => r + 1), 150);
    return () => clearInterval(id);
  }, [bagunca]);

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

    const balancos = [];
    for (let i = 0; i < 8; i++) {
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

    setTimeout(() => {
      setBagunca(false);
      setMensagem("tá bom, voltei ao normal 😌");
    }, 3500);
  }

  function valorAtual() {
    if (resultado && resultado !== "Erro") return Number(resultado);
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

  function aoTocar(tecla) {
    const ultimaTecla = expressao.slice(-1);
    if (mensagem && tecla !== "OFF") setMensagem("");

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
      if (OPERADORES.includes(ultimaTecla)) {
        setExpressao(expressao + formatar(memoria));
      } else {
        setExpressao(formatar(memoria));
      }
      setResultado("");
    } else if (OPERADORES.includes(tecla)) {
      // continua a conta a partir do resultado anterior
      if (resultado && resultado !== "Erro") {
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
    await limpar();
  }

  function confirmarLimpeza() {
    if (historico.length === 0) return;

    Alert.alert("Limpar histórico", "Quer apagar todas as contas salvas?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: "destructive", onPress: limparHistorico },
    ]);
  }

  return (
    <View style={styles.container}>
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
        <Teclado onPress={aoTocar} bagunca={bagunca} />
      </Animated.View>

      <View style={styles.acoes}>
        <Pressable
          style={({ pressed }) => [
            styles.acao,
            styles.verHistorico,
            pressed && styles.pressionado,
          ]}
          onPress={() => navigation.navigate("Historico", { historico })}
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
