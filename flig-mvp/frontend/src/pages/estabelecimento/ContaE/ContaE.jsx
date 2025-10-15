import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextImports.js';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCep } from '../../../hooks/useCep.js';
import { api } from '../../../services/api';
import Layout from '../../../components/Layout';
import styles from './ContaE.module.css';

function validateCNPJ(cnpj) {
  return /^\d{14}$/.test(cnpj.replace(/\D/g, ''));
}

export default function ContaE() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    razao: '',
    cnpj: '',
    telefone: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    uf: '',
    numero: '',
    email: '',
    descricao: '',
    imagem: null,
    senha: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Carregar dados do estabelecimento
  useEffect(() => {
    const loadEstablishmentData = async () => {
      try {
        if (user?.id) {
          console.log('🔍 Carregando dados do estabelecimento ID:', user.id);
          const response = await api.get(`/api/establishments/${user.id}`);
          console.log('📥 Resposta completa:', response);
          const establishmentData = response.data.data || response.data;
          console.log('📥 Dados do estabelecimento:', establishmentData);
          
          setForm({
            razao: establishmentData.nome_empresa || '',
            cnpj: establishmentData.cnpj || '',
            telefone: establishmentData.telefone_empresa || '',
            cep: establishmentData.cep_empresa || '',
            endereco: establishmentData.endereco_empresa || '',
            bairro: establishmentData.bairro_empresa || '',
            cidade: establishmentData.cidade_empresa || '',
            uf: establishmentData.uf_empresa || '',
            numero: establishmentData.numero_empresa || '',
            email: establishmentData.email_empresa || user?.email || '',
            descricao: establishmentData.descricao_empresa || '',
            imagem: establishmentData.imagem_empresa ? `/api/establishments/${user.id}/image` : null,
            senha: '',
            novaSenha: '',
            confirmarSenha: ''
          });
          console.log('✅ Formulário atualizado com dados do estabelecimento');
          
          // Se há imagem, definir preview
          if (establishmentData.imagem_empresa) {
            setImagePreview(`/api/establishments/${user.id}/image`);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do estabelecimento:', error);
        setApiError('Erro ao carregar dados do estabelecimento');
      } finally {
        setLoading(false);
      }
    };

    loadEstablishmentData();
  }, [user]);

  // Carregar dados do plano
  useEffect(() => {
    const loadPlanData = async () => {
      try {
        const response = await api.get('/api/plans/status');
        if (response.data.success) {
          setPlanData(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do plano:', error);
      }
    };

    loadPlanData();
  }, []);

  // Funções auxiliares para dados do plano
  const getPlanName = () => {
    if (!planData?.hasActivePlan) return 'Nenhum plano ativo';
    if (planData?.subscription?.plano_id === 1) return 'Essencial';
    if (planData?.subscription?.plano_id === 2) return 'Profissional';
    return 'Plano desconhecido';
  };

  const getPlanStatus = () => {
    if (!planData?.hasActivePlan) return 'inativo';
    return 'ativo';
  };

  const formatExpirationDate = () => {
    if (!planData?.hasActivePlan || !planData?.subscription?.data_vencimento) {
      return 'N/A';
    }
    const date = new Date(planData.subscription.data_vencimento);
    return date.toLocaleDateString('pt-BR');
  };

  // Funções para lidar com imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, imagem: 'Por favor, selecione apenas arquivos de imagem' });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, imagem: 'A imagem deve ter no máximo 5MB' });
        return;
      }

      setForm({ ...form, imagem: file });
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm({ ...form, imagem: null });
    setImagePreview(null);
  };

  // Usar hook personalizado para busca de CEP
  const { endereco: cepEndereco, loading: cepLoading, error: cepError } = useCep(form.cep.replace(/\D/g, ''));

  // Atualizar endereço quando CEP for encontrado
  useEffect(() => {
    if (cepEndereco) {
      setForm(prev => ({
        ...prev,
        endereco: cepEndereco,
      }));
    }
  }, [cepEndereco]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function validate() {
    const newErrors = {};
    if (!form.razao) newErrors.razao = 'Razão Social obrigatória';
    if (!form.cnpj) newErrors.cnpj = 'CNPJ obrigatório';
    else if (!validateCNPJ(form.cnpj)) newErrors.cnpj = 'CNPJ inválido (apenas números)';
    if (!form.telefone) newErrors.telefone = 'Telefone obrigatório';
    if (!form.cep) newErrors.cep = 'CEP obrigatório';
    if (!form.endereco) newErrors.endereco = 'Endereço obrigatório';
    if (!form.bairro) newErrors.bairro = 'Bairro obrigatório';
    if (!form.cidade) newErrors.cidade = 'Cidade obrigatória';
    if (!form.uf) newErrors.uf = 'UF obrigatória';
    if (!form.numero) newErrors.numero = 'Número obrigatório';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSubmitting(true);

    try {
      // Preparar dados para envio
      const updateData = {
        nome_empresa: form.razao,
        cnpj: form.cnpj,
        telefone_empresa: form.telefone,
        cep_empresa: form.cep,
        endereco_empresa: form.endereco,
        bairro_empresa: form.bairro,
        cidade_empresa: form.cidade,
        uf_empresa: form.uf,
        numero_empresa: form.numero,
        descricao_empresa: form.descricao
      };

      let response;
      // Se há uma nova imagem, enviar como FormData
      if (form.imagem) {
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
          formData.append(key, updateData[key]);
        });
        formData.append('imagem_empresa', form.imagem);

        response = await api.put(`/api/establishments/${user.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.put(`/api/establishments/${user.id}`, updateData);
      }

      if (response.data.success) {
        alert('Dados atualizados com sucesso!');
      } else {
        setApiError(response.data.message || 'Erro ao atualizar dados');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setApiError('Erro ao atualizar dados. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      try {
        const response = await api.delete(`/api/establishments/${user.id}`);
        if (response.data.success) {
          logout();
          navigate('/');
        } else {
          setApiError('Erro ao excluir conta');
        }
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        setApiError('Erro ao excluir conta. Tente novamente.');
      }
    }
  };

  const handleLogoutAll = async () => {
    try {
      const response = await api.post('/api/auth/logout-all');
      if (response.data.success) {
        logout();
        navigate('/');
      } else {
        setApiError('Erro ao encerrar sessões');
      }
    } catch (error) {
      console.error('Erro ao encerrar sessões:', error);
      setApiError('Erro ao encerrar sessões. Tente novamente.');
    }
  };

  const handleSendPasswordResetEmail = async () => {
    setSendingEmail(true);
    setApiError('');

    try {
      // Chama a API para enviar email de recuperação (estabelecimento logado)
      const response = await api.post('/api/auth/forgot-password-fixed', {});
      
      if (response.data.success) {
        // Email foi enviado com sucesso
        alert('Email de alteração de senha enviado! Verifique sua caixa de entrada.');
      } else {
        setApiError(response.data.message || 'Erro ao enviar email.');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setApiError('Erro ao enviar email. Tente novamente.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <Layout userType="estabelecimento" showSidebar={false}>
        <div className={styles['contaE-container']}>Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout userType="estabelecimento" showSidebar={false}>
      <div className={styles['contaE-container']}>
        <main className={styles['contaE-main']}>
          <section className={styles['contaE-form-box']}>
            <button className={styles['contaE-back']} onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h2>Dados da Empresa</h2>
            
            <div className={styles['contaE-layout']}>
              <div className={styles['contaE-form-section']}>
                <form className={styles['contaE-form']} onSubmit={handleSubmit} noValidate>
                  <input name="razao" type="text" placeholder="Razão Social:" value={form.razao} onChange={handleChange} />
                  {errors.razao && <span className={styles['erro']}>{errors.razao}</span>}
                  
                  <input name="cnpj" type="text" placeholder="CNPJ:" value={form.cnpj} onChange={handleChange} />
                  {errors.cnpj && <span className={styles['erro']}>{errors.cnpj}</span>}
                  
                  <input name="telefone" type="text" placeholder="Telefone:" value={form.telefone} onChange={handleChange} />
                  {errors.telefone && <span className={styles['erro']}>{errors.telefone}</span>}
                  
                  <input name="cep" type="text" placeholder="CEP:" value={form.cep} onChange={handleChange} />
                  {cepLoading && <span style={{ fontSize: '12px', color: '#888' }}>Buscando...</span>}
                  {errors.cep && <span className={styles['erro']}>{errors.cep}</span>}
                  {cepError && <span className={styles['erro']}>{cepError}</span>}
                  
                  <input name="endereco" type="text" placeholder="Endereço:" value={form.endereco} onChange={handleChange} />
                  {errors.endereco && <span className={styles['erro']}>{errors.endereco}</span>}
                  
                  <div className={styles['contaE-row-four']}>
                    <input name="cidade" type="text" placeholder="Cidade:" className={styles['input-cidade']} value={form.cidade} onChange={handleChange} />
                    <input name="bairro" type="text" placeholder="Bairro:" className={styles['input-bairro']} value={form.bairro} onChange={handleChange} />
                    <input name="uf" type="text" placeholder="UF:" className={styles['input-uf']} value={form.uf} onChange={handleChange} maxLength="2" />
                    <input name="numero" type="text" placeholder="Nº:" className={styles['input-numero']} value={form.numero} onChange={handleChange} />
                  </div>
                  {errors.cidade && <span className={styles['erro']}>{errors.cidade}</span>}
                  {errors.bairro && <span className={styles['erro']}>{errors.bairro}</span>}
                  {errors.uf && <span className={styles['erro']}>{errors.uf}</span>}
                  {errors.numero && <span className={styles['erro']}>{errors.numero}</span>}
                  
                  <textarea 
                    name="descricao" 
                    placeholder="Descrição da empresa:" 
                    value={form.descricao} 
                    onChange={handleChange}
                    rows="3"
                    style={{ resize: 'none', minHeight: '80px' }}
                  />
                  {errors.descricao && <span className={styles['erro']}>{errors.descricao}</span>}
                  
                  {apiError && <span className={styles['erro']}>{apiError}</span>}
                  
                  <div className={styles['contaE-salvar-wrapper']}>
                    <button type="submit" className={styles['btn-salvar']} disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar Alterações'}</button>
                  </div>
                </form>
              </div>

              <div className={styles['contaE-image-section']}>
                <div className={styles['contaE-image-container']}>
                  <div className={styles['contaE-image-placeholder']}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className={styles['contaE-image-preview']} />
                    ) : (
                      <div className={styles['contaE-image-circle']}></div>
                    )}
                  </div>
                  <label className={styles['contaE-image-label']}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <div className={styles['contaE-image-button']}>
                      <span className={styles['contaE-edit-icon']}>✏️</span>
                      <span>Editar Imagem de Perfil</span>
                    </div>
                  </label>
                  {errors.imagem && <span className={styles['erro']}>{errors.imagem}</span>}
                  
                  {imagePreview && (
                    <button type="button" onClick={removeImage} className={styles['contaE-remove-image']}>
                      Remover Imagem
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        <div className={styles['contaE-grid']}>
          <div className={`${styles['contaE-card']} ${styles['contaE-access']}`}>
            <h3>Conta de acesso</h3>
            <div className={styles['contaE-info']}>
              <label htmlFor="email">E-mail:</label>
              <input 
                type="email" 
                id="email" 
                value={form.email} 
                readOnly
                className={styles['input-readonly']}
              />
            </div>
            <div className={styles['contaE-info']}>
              <label htmlFor="senha">Senha:</label>
              <div className={styles['senha-wrapper']}>
                <input 
                  type="password" 
                  id="senha" 
                  value="••••••••" 
                  readOnly
                  className={styles['input-readonly']}
                />
                <span 
                  onClick={handleSendPasswordResetEmail}
                  className={styles['text-alterar']}
                  style={{ cursor: sendingEmail ? 'not-allowed' : 'pointer', opacity: sendingEmail ? 0.6 : 1 }}
                >
                  {sendingEmail ? 'Enviando...' : 'Alterar'}
                </span>
              </div>
            </div>
          </div>
          <div className={`${styles['contaE-card']} ${styles['contaE-plan']}`}>
            <h3>Plano da Empresa</h3>
            <p>Plano: <strong>{getPlanName()}</strong> ({getPlanStatus()})</p>
            <p>Válido até: <strong>{formatExpirationDate()}</strong></p>
          </div>
          <div className={`${styles['contaE-card']} ${styles['contaE-sessions']}`}>
            <h3>Encerrar sessões</h3>
            <button className={styles['btn-sair']} onClick={handleLogoutAll}>
              <LogOut size={16} /> Encerrar Sessões
            </button>
            <p>Termine a sessão de forma segura em todos os dispositivos conectados.</p>
          </div>
          <div className={`${styles['contaE-card']} ${styles['contaE-delete']}`}>
            <h3>Excluir conta</h3>
            <button className={styles['btn-delete']} onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Excluir conta
            </button>
            <p>Se você não deseja mais utilizar a Flig, pode solicitar a exclusão permanente de sua conta.</p>
          </div>
          <div className={`${styles['contaE-card']} ${styles['contaE-terms']}`}>
            <h3>Termos de serviço</h3>
            <p>Ao utilizar a Flig, você concorda com nossos Termos de Serviço. Recomendamos a leitura para entender melhor suas responsabilidades e direitos ao usar a plataforma.</p>
          </div>
        </div>
        </main>
      </div>
    </Layout>
  );
}
