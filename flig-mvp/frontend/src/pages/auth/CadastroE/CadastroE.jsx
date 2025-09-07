import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./CadastroE.css";

export default function CadastroE() {
  const navigate = useNavigate();

  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpjValido, setCnpjValido] = useState(true);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Buscar dados do CEP
  useEffect(() => {
    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setEndereco(data.logradouro || "");
            setBairro(data.bairro || "");
            setCidade(data.localidade || "");
            setUf(data.uf || "");
          }
        })
        .catch((err) => console.error("Erro ao buscar CEP:", err));
    }
  }, [cep]);

  // Buscar dados do CNPJ (via backend)
  useEffect(() => {
    if (cnpj.length === 14) {
      fetch(`http://localhost:5000/api/cnpj/${cnpj}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📡 Dados do backend:", data);
          if (data.valid && data.company_name) {
            setRazaoSocial(data.company_name);
            setCnpjValido(true);
          } else {
            setRazaoSocial("");
            setCnpjValido(false);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar CNPJ:", err);
          setRazaoSocial("");
          setCnpjValido(false);
        });
    } else {
      setRazaoSocial("");
      setCnpjValido(true);
    }
  }, [cnpj]);

  // Função para cadastrar empresa
  const handleSubmit = async (e) => {
  e.preventDefault();

  const empresa = {
  nome_empresa: razaoSocial,
  cnpj,
  cep_empresa: cep,
  endereco_empresa: endereco,
};


  try {
    const response = await fetch("http://localhost:5000/api/empresa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(empresa),
    });

    const data = await response.json();
    console.log("📡 Resposta do servidor:", data);

    if (data.success) {
      alert("✅ Empresa cadastrada com sucesso!");
    } else {
      alert("❌ Erro: " + data.message);
    }
  } catch (err) {
    console.error("❌ Erro ao cadastrar empresa:", err);
  }
};


  return (
    <div className="empresa-cadastro-container">
      <div className="empresa-cadastro-left">
        <div className="empresa-cadastro-logo">
          <img src="/logo-flig.svg" alt="Logo FLIG" className="empresa-cadastro-logo-img" />
          <p className="empresa-cadastro-slogan">Soluções de Agilidade</p>
        </div>
        <div className="empresa-cadastro-help">
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>

      <div className="empresa-cadastro-right">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="empresa-cadastro-back-button"
        >
          ← Voltar
        </button>

        <form className="empresa-cadastro-form" onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

          <input
            type="text"
            placeholder="Razão Social:"
            className="empresa-cadastro-input"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            style={{ borderColor: cnpjValido ? "" : "red" }}
          />
          {!cnpjValido && (
            <p style={{ color: "red", marginTop: "4px" }}>CNPJ inválido</p>
          )}

          <input
            type="email"
            placeholder="E-mail:"
            className="empresa-cadastro-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="CNPJ:"
            className="empresa-cadastro-input"
            value={cnpj}
            onChange={(e) =>
              setCnpj(e.target.value.replace(/\D/g, "").slice(0, 14))
            }
            style={{ borderColor: cnpjValido ? "" : "red" }}
          />

          <input
            type="text"
            placeholder="CEP:"
            className="empresa-cadastro-input"
            value={cep}
            onChange={(e) =>
              setCep(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
          />

          <input
            type="text"
            placeholder="Endereço:"
            className="empresa-cadastro-input"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
          <input
            type="text"
            placeholder="Bairro:"
            className="empresa-cadastro-input"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
          <input
            type="text"
            placeholder="Cidade:"
            className="empresa-cadastro-input"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          <input
            type="text"
            placeholder="UF:"
            className="empresa-cadastro-input"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="empresa-cadastro-input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <input
            type="password"
            placeholder="Repita a Senha"
            className="empresa-cadastro-input"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />

          <p className="empresa-cadastro-login">
            Já tem uma conta? <a href="/login-estab">Entrar</a>
          </p>

          <button type="submit" className="empresa-cadastro-button">
            Criar Conta
          </button>

        </form>

        <footer className="empresa-cadastro-footer">
          Copyright© 2025 Flig Soluções de agilidade. Todos os Direitos
          Reservados
        </footer>
      </div>
    </div>
  );
}
