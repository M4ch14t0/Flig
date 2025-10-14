import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  CreditCard, 
  Building, 
  Smartphone, 
  Clock, 
  Shield, 
  MessageCircle,
  ArrowLeft,
  Home
} from 'lucide-react';
import styles from './FAQ.module.css';

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "Geral",
      icon: <HelpCircle size={20} />,
      questions: [
        {
          question: "Como funciona a Flig?",
          answer: "A Flig é uma plataforma de filas virtuais que conecta clientes e estabelecimentos. Você pode entrar em filas remotamente, acompanhar sua posição em tempo real e até pagar para avançar posições, tudo sem sair de casa."
        },
        {
          question: "Preciso baixar algum aplicativo?",
          answer: "Não! Você pode usar a Flig diretamente pelo navegador web. Estabelecimentos também usam o painel web. Um aplicativo móvel está em desenvolvimento e será lançado em breve."
        },
        {
          question: "A Flig é gratuita?",
          answer: "Sim! O uso básico da Flig é gratuito para clientes. Estabelecimentos têm planos gratuitos e pagos, dependendo das funcionalidades que precisam."
        }
      ]
    },
    {
      category: "Para Clientes",
      icon: <Users size={20} />,
      questions: [
        {
          question: "Como entro em uma fila?",
          answer: "É simples! Acesse a lista de estabelecimentos, escolha o local desejado e clique em 'Entrar na fila'. Você receberá um número de posição e poderá acompanhar sua vez em tempo real."
        },
        {
          question: "Posso sair da fila a qualquer momento?",
          answer: "Sim! Você pode sair da fila a qualquer momento sem penalidades. Sua posição será liberada para o próximo cliente."
        },
        {
          question: "Como sei quando é minha vez?",
          answer: "Você receberá notificações quando sua vez estiver chegando. Também pode acompanhar sua posição em tempo real na página 'Minhas Filas'."
        }
      ]
    },
    {
      category: "Sistema de Pagamentos",
      icon: <CreditCard size={20} />,
      questions: [
        {
          question: "O que é o avanço pago?",
          answer: "O avanço pago é uma funcionalidade que permite pagar para avançar algumas posições na fila."
        },
        {
          question: "Como faço o pagamento?",
          answer: "Você pode pagar com cartão de crédito ou débito diretamente pela plataforma. O sistema é seguro e seus dados são protegidos."
        },
        {
          question: "Posso cancelar um pagamento?",
          answer: "Sim, você pode cancelar um pagamento antes da confirmação. Após confirmado, entre em contato com o estabelecimento para resolver."
        }
      ]
    },
    {
      category: "Para Estabelecimentos",
      icon: <Building size={20} />,
      questions: [
        {
          question: "Como minha empresa pode usar a Flig?",
          answer: "Sua empresa pode se cadastrar como estabelecimento, criar filas personalizadas, acompanhar estatísticas detalhadas e gerenciar atendimentos através do painel web."
        },
        {
          question: "Quais funcionalidades estão disponíveis?",
          answer: "Você pode criar múltiplas filas, configurar horários de funcionamento, ativar sistema de pagamento para avanço, gerar relatórios e muito mais."
        },
        {
          question: "Como gerencio os clientes na fila?",
          answer: "Através do painel de controle, você pode chamar o próximo cliente, pausar a fila, ver estatísticas em tempo real e gerenciar todas as operações."
        }
      ]
    },
    {
      category: "Segurança e Privacidade",
      icon: <Shield size={20} />,
      questions: [
        {
          question: "Meus dados estão seguros?",
          answer: "Sim! Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança para proteger seus dados pessoais e financeiros."
        },
        {
          question: "A Flig compartilha meus dados?",
          answer: "Não! Seus dados pessoais são mantidos em sigilo e não são compartilhados com terceiros, exceto quando necessário para o funcionamento do serviço."
        }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={20} />
            Voltar ao Início
          </Link>
          <div className={styles.titleSection}>
            <div className={styles.titleIcon}>
              <HelpCircle size={32} />
            </div>
            <div>
              <h1 className={styles.title}>Perguntas Frequentes</h1>
              <p className={styles.subtitle}>Encontre respostas para as dúvidas mais comuns sobre a Flig</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.faqContainer}>
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className={styles.category}>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryIcon}>
                  {category.icon}
                </div>
                <h2 className={styles.categoryTitle}>{category.category}</h2>
              </div>
              
              <div className={styles.questions}>
                {category.questions.map((item, questionIndex) => {
                  const itemIndex = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems[itemIndex];
                  
                  return (
                    <div key={questionIndex} className={styles.questionItem}>
                      <button 
                        className={styles.questionButton}
                        onClick={() => toggleItem(itemIndex)}
                      >
                        <span className={styles.questionText}>{item.question}</span>
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {isOpen && (
                        <div className={styles.answer}>
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <div className={styles.contactCard}>
            <MessageCircle size={24} />
            <h3>Não encontrou sua dúvida?</h3>
            <p>Entre em contato conosco e teremos prazer em ajudar!</p>
            <div className={styles.contactButtons}>
              <Link to="/escolha-login" className={styles.contactButton}>
                <Home size={16} />
                Acessar Sistema
              </Link>
              <a href="mailto:FligPTI@gmail.com" className={styles.contactButton}>
                <MessageCircle size={16} />
                Enviar Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
