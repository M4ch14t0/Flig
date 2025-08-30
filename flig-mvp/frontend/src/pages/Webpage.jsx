import { Link, useNavigate } from 'react-router-dom';
import styles from './Webpage.module.css';

function Webpage() {
  const navigate = useNavigate();
  return (
    <div className={styles.welcome}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <span className={styles.highlight}>F</span>lig
        </div>

        <div className={styles.navdivision}>
          <ul className={styles.navLinks}>
            <li>
              <a href="#sobre">Sobre Nós</a>
            </li>
            <li>
              <a href="#equipe">Nosso Time</a>
            </li>
            <li>
              <a href="#produto">Produto</a>
            </li>
            <li>
              <a href="#plano">Planos</a>
            </li>
            <li>
              <a href="#baixarapp">Baixe o App</a>
            </li>
          </ul>

          <div className={styles.navButtons}>
            <Link to="/escolha-login" className={styles.loginLink}>
              Login
            </Link>
            <div className={styles.navSeparator}></div>
            <a href="#contato" className={styles.contactbutton}>
              Fale Conosco
            </a>
          </div>
        </div>

        <div className={styles.navUnderline}></div>
      </nav>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            A solução para filas que você esperava!
          </h1>
          <p className={styles.subtitle}>
            Levamos menos de 60s entre conexão e realização de fila. Controle
            processos com facilidade, entre em filas com um clique. Ninguém
            gosta de esperar. Simples assim!
          </p>
          <div className={styles.headerButtons}>
            <button className={styles.readmore}>Leia Mais</button>
            <Link to="/escolha-login" className={styles.loginOutline}>
              Login
              <span>  →</span>
            </Link>
          </div>
        </div>

        <div className={styles.headerImage}>
          <img src="/running-illustration.svg" alt="Ícone de corrida" />
        </div>
      </header>

      {/* SOBRE */}
      <section id="sobre" className={styles.section}>
        <h2>Sobre Nós</h2>
        <p>
          A Flig nasceu para agilizar a vida de quem espera e de quem atende.
          Desenvolvemos uma plataforma de filas virtuais, onde usuários
          acompanham o andamento e tempo estimado de espera em tempo real. Nada
          de papel, senha física ou espera desnecessária — com a Flig, o
          processo é 100% digital, simples e eficiente. Também oferecemos
          recursos como saltos de fila pagos e painéis com estatísticas em tempo
          real para quem quer ir além. Tecnologia com propósito: otimizar o
          tempo de todos. Simples assim.
        </p>
      </section>

      {/* EQUIPE */}
      <section id="equipe" className={styles.equipe}>
        <h2>Nossa Equipe</h2>
        <div className={styles.team}>
          <div className={styles.member}>
            <img src="/equipe/rafael.jpg" alt="Rafael Matos" />
            <p className={styles.name}>Rafael Matos</p>
            <p className={styles.role}>Desenvolvedor, Programador</p>
          </div>
          <div className={styles.member}>
            <img src="/equipe/guilherme.jpg" alt="Guilherme Correia" />
            <p className={styles.name}>Guilherme Correia</p>
            <p className={styles.role}>Desenvolvedor, Analista de dados</p>
          </div>
          <div className={styles.member}>
            <img src="/equipe/gabriela.jpg" alt="Gabriela Almeida" />
            <p className={styles.name}>Gabriela Almeida</p>
            <p className={styles.role}>Desenvolvedora, Designer</p>
          </div>
          <div className={styles.member}>
            <img src="/equipe/nicolas.jpg" alt="Nicolas Rocha" />
            <p className={styles.name}>Nicolas Rocha</p>
            <p className={styles.role}>Desenvolvedor, Financeiro</p>
          </div>
        </div>
      </section>

      {/* OFERECE */}
      <section id="oferece" className={styles.section}>
        <h2>O que a Flig oferece para você?</h2>
        <p>
          <strong>Usando a Flig você garante:</strong>
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <p className={styles.icon}>🧾</p>
            <h3>Agilidade</h3>
            <p>
              A FLIG acredita que tempo é valioso. Por isso, trabalha para
              tornar o atendimento mais rápido, eficiente e moderno, conectando
              estabelecimentos e clientes com fluidez.
            </p>
          </div>
          <div className={styles.feature}>
            <p className={styles.icon}>🔁</p>
            <h3>Flexibilidade</h3>
            <p>
              Cada estabelecimento é único. Por isso, a FLIG oferece planos e
              configurações personalizadas, respeitando o fluxo, o público e o
              ritmo de cada local.
            </p>
          </div>
          <div className={styles.feature}>
            <p className={styles.icon}>💡</p>
            <h3>Inovação</h3>
            <p>
              Estamos sempre buscando novas formas de transformar a gestão de
              filas, trazendo funcionalidades atualizadas e tendências
              tecnológicas que geram impacto positivo no dia a dia dos usuários.
            </p>
          </div>
          <div className={styles.feature}>
            <p className={styles.icon}>🏆</p>
            <h3>Pioneirismo</h3>
            <p>
              Somos a primeira plataforma 100% digital focada em otimizar o
              tempo, com abordagem inteligente e tecnologia de ponta.
            </p>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className={styles.section}>
        <h2>Entre em Contato Conosco</h2>
        <form className={styles.contactForm}>
          <input type="text" placeholder="Nome:" />
          <input type="email" placeholder="Email:" />
          <textarea
            rows="4"
            placeholder="Descreva-nos seu problema:"
          ></textarea>
          <button type="submit">Enviar</button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <img
              src="/logo-footer.svg"
              alt="Logo Flig"
              style={{ width: '80px' }}
            />
            <p>
              <strong>FligPTI@gmail.com</strong>
            </p>
            <div>
              <img src="/social/instagram.svg" alt="Instagram" />
              <img src="/social/linkedin.svg" alt="LinkedIn" />
              <img src="/social/tiktok.svg" alt="TikTok" />
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>Serviços:</h4>
            <p>Login Clientes</p>
            <p>App Flig</p>
            <p>Termos de privacidade</p>
          </div>

          <div className={styles.footerColumn}>
            <h4>Ajuda:</h4>
            <p>📑 FAQ</p>
            <p>🛠️ Suporte</p>
            <p>📞 Contate-nos</p>
          </div>

          <div className={styles.footerColumn}>
            <h4>Tem alguma dica pra gente?</h4>
            <p>Dê um FeedBack! Agradecemos Muito</p>
            <div className={styles.footerInput}>
              <input type="text" placeholder="Digite Aqui..." />
              <img src="/icons/send.svg" alt="Enviar" />
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          &copy; {new Date().getFullYear()} Flig Soluções de agilidade.
          Todos os Direitos Reservados
        </div>
      </footer>
    </div>
  );
}

export default Webpage;
