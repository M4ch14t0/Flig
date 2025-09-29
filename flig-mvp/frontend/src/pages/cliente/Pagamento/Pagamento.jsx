import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiMapPin, FiUsers, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';

const sidebarLinks = [
  { to: '/cliente/home', label: 'Home', icon: <FiHome /> },
  { to: '/cliente/estabelecimentos', label: 'Estabelecimentos', icon: <FiMapPin /> },
  { to: '/cliente/minhas-filas', label: 'Minhas Filas', icon: <FiUsers />, active: true }
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateCPF(cpf) {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ''));
}

function calculateAdvancePrice(positions) {
  const initialPrice = 10.00; // R$ 10,00 inicial
  const interestRate = 0.15; // 15% de juros
  
  if (positions <= 0) return 0;
  if (positions === 1) return initialPrice;
  
  // Juros compostos: P * (1 + r)^n
  const totalPrice = initialPrice * Math.pow(1 + interestRate, positions - 1);
  
  // Arredonda para 2 casas decimais
  return Math.round(totalPrice * 100) / 100;
}

function Pagamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const queueData = location.state?.queueData;

  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    numeroCartao: '',
    cvv: '',
    mesVencimento: '',
    anoVencimento: '',
    valor: calculateAdvancePrice(queueData?.positionsToAdvance || 1).toFixed(2),
    status: 'pendente',
  });
  const [pagou, setPagou] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Se não há dados da fila, redireciona para minhas filas
  useEffect(() => {
    if (!queueData) {
      alert('Dados da fila não encontrados. Redirecionando...');
      navigate('/cliente/minhas-filas');
    } else {
      // Preenche dados do usuário automaticamente
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      if (userEmail) setForm(prev => ({ ...prev, email: userEmail }));
      if (userName) setForm(prev => ({ ...prev, nome: userName }));
    }
  }, [queueData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  function validate() {
    const newErrors = {};
    if (!form.nome) newErrors.nome = 'Nome obrigatório';
    if (!form.email) newErrors.email = 'E-mail obrigatório';
    else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.cpf) newErrors.cpf = 'CPF obrigatório';
    else if (!validateCPF(form.cpf)) newErrors.cpf = 'CPF inválido (apenas números)';
    if (!form.numeroCartao) newErrors.numeroCartao = 'Número do cartão obrigatório';
    else if (form.numeroCartao.replace(/\D/g, '').length !== 16) newErrors.numeroCartao = 'Número do cartão deve ter 16 dígitos';
    if (!form.cvv) newErrors.cvv = 'CVV obrigatório';
    else if (form.cvv.length !== 3) newErrors.cvv = 'CVV deve ter 3 dígitos';
    if (!form.mesVencimento) newErrors.mesVencimento = 'Mês de vencimento obrigatório';
    else if (parseInt(form.mesVencimento) < 1 || parseInt(form.mesVencimento) > 12) newErrors.mesVencimento = 'Mês inválido';
    if (!form.anoVencimento) newErrors.anoVencimento = 'Ano de vencimento obrigatório';
    else if (parseInt(form.anoVencimento) < new Date().getFullYear()) newErrors.anoVencimento = 'Ano não pode ser passado';
    return newErrors;
  }

  const handlePagar = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    
    setSubmitting(true);
    
    try {
      // Processa o avanço na fila via API
      const response = await api.post(`/queues/${queueData.queueId}/advance`, {
        clientId: queueData.userId,
        positions: queueData.positionsToAdvance || 1, // Avançar posições selecionadas
        paymentData: {
          paymentMethod: 'credit_card',
          cardData: {
            number: form.numeroCartao.replace(/\D/g, ''),
            cvv: form.cvv,
            expiryMonth: parseInt(form.mesVencimento),
            expiryYear: parseInt(form.anoVencimento),
            holderName: form.nome
          }
        }
      });

      if (response.data.success) {
        setForm((prev) => ({ ...prev, status: 'aprovado' }));
        setPagou(true);
      } else {
        alert(`Erro no pagamento: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!queueData) {
    return null; // Não renderiza nada se não há dados da fila
  }

  return (
    <Layout sidebarLinks={sidebarLinks} userType="cliente" showFooter={false}>
      <div style={{ 
        background: '#1F1F1F', 
        minHeight: '100vh', 
        padding: '20px',
        color: '#fff'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 30,
          fontSize: 18,
          fontWeight: 500
        }}>
          <button 
            onClick={() => navigate('/cliente/minhas-filas')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              marginRight: 12,
              color: '#fff'
            }}
          >
            <FiArrowLeft size={20} />
          </button>
          Pagamento:
        </div>

        {pagou ? (
          <div style={{ 
            textAlign: 'center', 
            background: '#272626',
            borderRadius: 12,
            padding: 40,
            margin: '0 auto',
            maxWidth: 400,
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#28a745' }}>✅</div>
            <h3 style={{ color: '#28a745', marginBottom: 16 }}>Pagamento aprovado!</h3>
            <p style={{ marginBottom: 24 }}>
              Você avançou {queueData.positionsToAdvance || 1} {queueData.positionsToAdvance === 1 ? 'posição' : 'posições'} com sucesso!
            </p>
            <button 
              onClick={() => navigate('/cliente/minhas-filas')}
              style={{ 
                background: '#007bff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '12px 32px', 
                fontWeight: 600, 
                fontSize: 16, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#0056b3'}
              onMouseLeave={(e) => e.target.style.background = '#007bff'}
            >
              Voltar para Minhas Filas
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: 40, 
            maxWidth: 1200, 
            margin: '0 auto'
          }}>
            {/* Coluna Esquerda - Seus Dados */}
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 24, fontSize: 20 }}>Seus Dados:</h3>
              <form id="payment-form" onSubmit={handlePagar} noValidate>
                {/* Nome Completo */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    Nome Completo: *
                  </label>
                  <input 
                    name="nome" 
                    value={form.nome} 
                    onChange={handleChange} 
                    placeholder="Nome Completo..."
                    style={{ 
                      width: '100%', 
                      padding: 12, 
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }} 
                  />
                  {errors.nome && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.nome}</div>}
                </div>

                {/* Nome Social */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    Nome Social:
                  </label>
                  <input 
                    placeholder="Nome Comercial..."
                    style={{ 
                      width: '100%', 
                      padding: 12, 
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }} 
                  />
                </div>

                {/* E-mail */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    E-mail: *
                  </label>
                  <input 
                    name="email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="E-mail..."
                    style={{ 
                      width: '100%', 
                      padding: 12, 
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }} 
                  />
                  {errors.email && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
                </div>

                {/* Telefone */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    Telefone: *
                  </label>
                  <input 
                    placeholder="Número de telefone..."
                    style={{ 
                      width: '100%', 
                      padding: 12, 
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }} 
                  />
                </div>

                {/* CPF */}
                <div style={{ marginBottom: 30 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    CPF: *
                  </label>
                  <input 
                    name="cpf" 
                    value={form.cpf} 
                    onChange={handleChange} 
                    placeholder="CPF..."
                    style={{ 
                      width: '100%', 
                      padding: 12, 
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }} 
                  />
                  {errors.cpf && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.cpf}</div>}
                </div>

                {/* Dados de Pagamento */}
                <h3 style={{ marginBottom: 24, fontSize: 20 }}>Dados de Pagamento:</h3>

                {/* Formas de pagamento */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    Formas de pagamento: *
                  </label>
                  <select style={{ 
                    width: '100%', 
                    padding: 12, 
                    background: '#34495e',
                    border: '1px solid #4a5f7a',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none'
                  }}>
                    <option>Cartão de Crédito</option>
                  </select>
                </div>

                {/* Nome Completo no cartão */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontSize: 14,
                    color: '#fff'
                  }}>
                    Nome Completo: *
                  </label>
                  <input 
                    placeholder="Nome impresso no cartão..."
                    style={{ 
                      width: '100%', 
                      padding: 12, 
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }} 
                  />
                </div>

                {/* Número do Cartão e CVV */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontSize: 14,
                      color: '#fff'
                    }}>
                      Número do Cartão:
                    </label>
                    <input 
                      name="numeroCartao" 
                      value={form.numeroCartao} 
                      onChange={handleChange} 
                      placeholder="0000 0000 0000 0000"
                      style={{ 
                        width: '100%', 
                        padding: 12, 
                        background: '#34495e',
                        border: '1px solid #4a5f7a',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none'
                      }} 
                    />
                    {errors.numeroCartao && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.numeroCartao}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontSize: 14,
                      color: '#fff'
                    }}>
                      CVV: *
                    </label>
                    <input 
                      name="cvv" 
                      value={form.cvv} 
                      onChange={handleChange} 
                      placeholder="000"
                      maxLength="3"
                      style={{ 
                        width: '100%', 
                        padding: 12, 
                        background: '#34495e',
                        border: '1px solid #4a5f7a',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none'
                      }} 
                    />
                    {errors.cvv && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.cvv}</div>}
                  </div>
                </div>

                {/* Validação - Mês e Ano */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 30 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontSize: 14,
                      color: '#fff'
                    }}>
                      Validação: *
                    </label>
                    <input 
                      name="mesVencimento" 
                      value={form.mesVencimento} 
                      onChange={handleChange} 
                      placeholder="MM/AAAA"
                      style={{ 
                        width: '100%', 
                        padding: 12, 
                        background: '#34495e',
                        border: '1px solid #4a5f7a',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none'
                      }} 
                    />
                    {errors.mesVencimento && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.mesVencimento}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontSize: 14,
                      color: 'transparent'
                    }}>
                      .
                    </label>
                    <input 
                      name="anoVencimento" 
                      value={form.anoVencimento} 
                      onChange={handleChange} 
                      placeholder="AAAA"
                      style={{ 
                        width: '100%', 
                        padding: 12, 
                        background: '#34495e',
                        border: '1px solid #4a5f7a',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none'
                      }} 
                    />
                    {errors.anoVencimento && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.anoVencimento}</div>}
                  </div>
                </div>

                {/* Ícones dos cartões */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 30 }}>
                  <div style={{ 
                    width: 40, 
                    height: 25, 
                    background: '#e74c3c', 
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}>MC</div>
                  <div style={{ 
                    width: 40, 
                    height: 25, 
                    background: '#444', 
                    borderRadius: 4,
                    border: '1px solid #4a5f7a'
                  }}></div>
                  <div style={{ 
                    width: 40, 
                    height: 25, 
                    background: '#3498db', 
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 'bold'
                  }}>VISA</div>
                  <div style={{ 
                    width: 40, 
                    height: 25, 
                    background: '#3498db', 
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 'bold'
                  }}>AMEX</div>
                  <div style={{ 
                    width: 40, 
                    height: 25, 
                    background: '#e74c3c', 
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 'bold'
                  }}>ELO</div>
                </div>
              </form>
            </div>

            {/* Coluna Direita - Detalhes do Pagamento */}
            <div style={{ 
              flex: 1, 
              background: '#272626',
              padding: 30,
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: 'fit-content'
            }}>
              <h3 style={{ marginBottom: 24, fontSize: 20 }}>Detalhes do Pagamento:</h3>
              
              <div style={{ marginBottom: 30 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {queueData.positionsToAdvance || 1} {queueData.positionsToAdvance === 1 ? 'Avanço' : 'Avanços'}
                  </span>
                  <div style={{ 
                    width: 12, 
                    height: 12, 
                    border: '2px solid #bdc3c7',
                    borderRadius: '50%'
                  }}></div>
                </div>
                <hr style={{ border: '1px solid #4a5f7a', margin: '12px 0' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  <span>Preço base:</span>
                  <span>R$ 10,00</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  <span>Posições a avançar:</span>
                  <span>{queueData.positionsToAdvance || 1}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  <span>Taxa de juros:</span>
                  <span>15% por posição</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 12,
                  color: '#bdc3c7'
                }}>
                  <span>Limite máximo do estabelecimento:</span>
                  <span>{queueData.max_avancos || 8} posições</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  <span>Desconto:</span>
                  <span>R$ 0,00</span>
                </div>
                <hr style={{ border: '1px solid #4a5f7a', margin: '12px 0' }} />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  fontSize: 16
                }}>
                  <span>Total a pagar:</span>
                  <span>R$ {calculateAdvancePrice(queueData.positionsToAdvance || 1).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ 
                fontSize: 12, 
                color: '#bdc3c7', 
                lineHeight: 1.5,
                marginBottom: 20
              }}>
                Ao apoiar os pagamentos e serviços do pagamento da
                FLIG você está concordando com os Termos de Uso.
              </div>

              <div style={{ 
                fontSize: 12, 
                color: '#bdc3c7', 
                marginBottom: 20
              }}>
                Li e concordo com a <span style={{ color: '#3498db', textDecoration: 'underline' }}>Política de Privacidade</span>.
                <br />
                Li e concordo com os <span style={{ color: '#3498db', textDecoration: 'underline' }}>Termos de Uso</span>.
              </div>

              <button 
                type="submit" 
                form="payment-form"
                style={{ 
                  width: '100%', 
                  background: submitting ? '#6c757d' : '#007bff', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: 16, 
                  fontWeight: 600, 
                  fontSize: 16, 
                  cursor: submitting ? 'not-allowed' : 'pointer' 
                }} 
                disabled={submitting}
              >
                {submitting ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Pagamento;
