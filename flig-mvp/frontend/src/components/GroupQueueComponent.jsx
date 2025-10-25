/**
 * Componente de Fila com Suporte a Grupos para Sistema Flig
 * 
 * Exibe informações da fila bidimensional, permite entrada de clientes individuais
 * e grupos, e gerencia posições na fila em tempo real.
 * 
 * @author Flig Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContextImports.js';
import { api } from '../services/api';
import { Users, Clock, MapPin, Phone, Mail, CreditCard, ArrowUp, UserPlus, User, Plus, Minus, Download, Trash2, X } from 'lucide-react';
import styles from './QueueComponent.module.css';

export default function GroupQueueComponent({ queueId, establishmentId, onJoinSuccess, onError }) {
  const { user, userType } = useAuth();
  
  const [queue, setQueue] = useState(null);
  const [clients, setClients] = useState([]);
  const [groupedClients, setGroupedClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [clientPosition, setClientPosition] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinType, setJoinType] = useState('individual'); // 'individual' ou 'group'
  
  // Formulário de entrada individual
  const [individualForm, setIndividualForm] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  
  // Formulário de entrada em grupo
  const [groupForm, setGroupForm] = useState({
    leader: {
      nome: '',
      telefone: '',
      email: ''
    },
    members: []
  });

  // Cache para dados dos membros do grupo
  const [groupMembersCache, setGroupMembersCache] = useState([]);
  
  // Formulário de avanço

  // Carrega dados da fila
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [queueId]);

  // Preencher dados automaticamente quando o usuário estiver logado
  useEffect(() => {
    if (user && userType === 'cliente') {
      // Preencher dados do líder do grupo
      setGroupForm(prev => ({
        ...prev,
        leader: {
          nome: user.name || user.nome_usuario || '',
          telefone: user.telefone || user.telefone_usuario || '',
          email: user.email || user.email_usuario || ''
        }
      }));
      
      // Preencher dados do formulário individual
      setIndividualForm({
        nome: user.name || user.nome_usuario || '',
        telefone: user.telefone || user.telefone_usuario || '',
        email: user.email || user.email_usuario || ''
      });
    }
  }, [user, userType]);

  const loadQueueData = async () => {
    try {
      const [queueResponse, groupedResponse] = await Promise.all([
        api.get(`/api/queues/${queueId}`),
        api.get(`/api/queues/${queueId}/grouped`)
      ]);

      if (queueResponse.data.success) {
        setQueue(queueResponse.data.data);
      }

      if (groupedResponse.data.success) {
        setGroupedClients(groupedResponse.data.data.groupedClients);
        
        // Verifica se o usuário está na fila
        if (user && userType === 'cliente') {
          const userInQueue = findUserInGroupedClients(groupedResponse.data.data.groupedClients, user.email);
          if (userInQueue) {
            setClientPosition(userInQueue);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da fila:', error);
      if (onError) onError('Erro ao carregar dados da fila');
    } finally {
      setLoading(false);
    }
  };

  const findUserInGroupedClients = (groupedClients, userEmail) => {
    for (const position in groupedClients) {
      const clientsAtPosition = groupedClients[position];
      
      for (const client of clientsAtPosition) {
        // Verificar se é o próprio usuário (cliente individual)
        if (client.email === userEmail) {
          return client;
        }
        
        // Verificar se é líder de grupo
        if (client.isGroupLeader && client.groupMembers) {
          for (const member of client.groupMembers) {
            if (member.email === userEmail) {
              return client; // Retorna o líder do grupo
            }
          }
        }
      }
    }
    return null;
  };

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    setJoining(true);

    try {
      let response;
      
      if (joinType === 'individual') {
        // Entrada individual
        const clientData = {
          nome: individualForm.nome,
          telefone: individualForm.telefone,
          email: individualForm.email,
          isGroup: false
        };
        
        response = await api.post(`/api/queues/${queueId}/join`, clientData);
      } else {
        // Entrada em grupo
        const groupData = {
          nome: groupForm.leader.nome,
          telefone: groupForm.leader.telefone,
          email: groupForm.leader.email,
          groupMembers: groupForm.members,
          isGroup: true
        };
        
        response = await api.post(`/api/queues/${queueId}/join`, groupData);
        
        // Salvar dados dos membros no cache após sucesso
        saveMembersToCache();
      }

      if (response.data.success) {
        await loadQueueData(); // Recarrega dados
        if (onJoinSuccess) onJoinSuccess(response.data.data);
        setShowJoinForm(false);
        setShowGroupForm(false);
      } else {
        if (onError) onError(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      if (onError) onError(error.response?.data?.message || 'Erro ao entrar na fila');
    } finally {
      setJoining(false);
    }
  };




  const addGroupMember = () => {
    const newMember = { 
      nome: '', 
      dataNascimento: '', 
      cpf: '' 
    };
    setGroupForm({
      ...groupForm,
      members: [...groupForm.members, newMember]
    });
  };

  const removeGroupMember = (index) => {
    const newMembers = groupForm.members.filter((_, i) => i !== index);
    setGroupForm({ ...groupForm, members: newMembers });
  };

  const updateGroupMember = (index, field, value) => {
    const newMembers = [...groupForm.members];
    newMembers[index][field] = value;
    setGroupForm({ ...groupForm, members: newMembers });
  };

  // Salvar dados dos membros no cache
  const saveMembersToCache = () => {
    const cacheData = {
      timestamp: Date.now(),
      members: groupForm.members
    };
    localStorage.setItem('groupMembersCache', JSON.stringify(cacheData));
    setGroupMembersCache(groupForm.members);
  };

  // Carregar dados dos membros do cache
  const loadMembersFromCache = () => {
    try {
      const cached = localStorage.getItem('groupMembersCache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        // Verificar se o cache não é muito antigo (24 horas)
        if (Date.now() - cacheData.timestamp < 24 * 60 * 60 * 1000) {
          setGroupForm(prev => ({
            ...prev,
            members: cacheData.members
          }));
          setGroupMembersCache(cacheData.members);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
    }
  };

  // Limpar cache
  const clearMembersCache = () => {
    localStorage.removeItem('groupMembersCache');
    setGroupMembersCache([]);
  };

  const calculateEstimatedTime = (position) => {
    if (!queue || !position) return 0;
    return (position - 1) * Number(queue.tempo_estimado || 0);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando fila...</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className={styles.error}>
        <p>Fila não encontrada</p>
      </div>
    );
  }

  return (
    <div className={styles.queueContainer}>
      {/* Cabeçalho da Fila */}
      <div className={styles.queueHeader}>
        <h2 className={styles.queueName}>{queue.nome}</h2>
        <div className={styles.queueInfo}>
          <div className={styles.infoItem}>
            <Users size={16} />
            <span>{Object.keys(groupedClients).length} posições ocupadas</span>
          </div>
          <div className={styles.infoItem}>
            <Clock size={16} />
            <span>{Number(queue.tempo_estimado || 0)} min por posição</span>
          </div>
          <div className={styles.infoItem}>
            <CreditCard size={16} />
            <span>R$ {Number(queue.valor_avancos || 0).toFixed(2)} por avanço</span>
          </div>
        </div>
        {queue.descricao && (
          <p className={styles.queueDescription}>{queue.descricao}</p>
        )}
      </div>

      {/* Status da Fila */}
      <div className={`${styles.queueStatus} ${styles[queue.status]}`}>
        <span>Status: {queue.status}</span>
      </div>

      {/* Posição do Cliente */}
      {clientPosition && (
        <div className={styles.clientPosition}>
          <h3>Sua Posição na Fila</h3>
          <div className={styles.positionInfo}>
            <div className={styles.positionNumber}>
              <span className={styles.number}>{clientPosition.position}{clientPosition.subPosition || 'a'}</span>
              <span className={styles.label}>Posição</span>
            </div>
            <div className={styles.estimatedTime}>
              <Clock size={20} />
              <span>{calculateEstimatedTime(clientPosition.position)} min</span>
            </div>
          </div>
          
          {clientPosition.isGroupLeader && (
            <div className={styles.groupInfo}>
              <Users size={16} />
              <span>Líder do grupo ({clientPosition.groupSize} pessoas)</span>
            </div>
          )}
        </div>
      )}

      {/* Botões de Entrada na Fila */}
      {!clientPosition && userType === 'cliente' && (
        <div className={styles.joinOptions}>
          <button 
            className={styles.joinButton}
            onClick={() => {
              setJoinType('individual');
              setShowJoinForm(true);
            }}
          >
            <User size={16} />
            Entrar Individual
          </button>
          
          <button 
            className={styles.joinButton}
            onClick={() => {
              setJoinType('group');
              setShowGroupForm(true);
            }}
          >
            <Users size={16} />
            Entrar em Grupo
          </button>
        </div>
      )}

      {/* Formulário de Entrada Individual */}
      {showJoinForm && joinType === 'individual' && (
        <div className={styles.joinForm}>
          <h3>Entrar na Fila (Individual)</h3>
          <form onSubmit={handleJoinQueue}>
            <div className={styles.formGroup}>
              <label>Nome Completo</label>
              <input 
                type="text"
                value={individualForm.nome}
                onChange={(e) => setIndividualForm({
                  ...individualForm,
                  nome: e.target.value
                })}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Telefone</label>
              <input 
                type="tel"
                value={individualForm.telefone}
                onChange={(e) => setIndividualForm({
                  ...individualForm,
                  telefone: e.target.value
                })}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email"
                value={individualForm.email}
                onChange={(e) => setIndividualForm({
                  ...individualForm,
                  email: e.target.value
                })}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button 
                type="button"
                onClick={() => setShowJoinForm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={joining}
                className={styles.submitButton}
              >
                {joining ? 'Entrando...' : 'Entrar na Fila'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulário de Entrada em Grupo */}
      {showGroupForm && joinType === 'group' && (
        <div className={styles.joinForm}>
          <h3>Entrar na Fila (Grupo)</h3>
          <form onSubmit={handleJoinQueue}>
            <div className={styles.groupSection}>
              <h4>Líder do Grupo</h4>
              <div className={styles.formGroup}>
                <label>Nome do Líder</label>
                <input 
                  type="text"
                  value={groupForm.leader.nome}
                  onChange={(e) => setGroupForm({
                    ...groupForm,
                    leader: { ...groupForm.leader, nome: e.target.value }
                  })}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Telefone do Líder</label>
                <input 
                  type="tel"
                  value={groupForm.leader.telefone}
                  onChange={(e) => setGroupForm({
                    ...groupForm,
                    leader: { ...groupForm.leader, telefone: e.target.value }
                  })}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email do Líder</label>
                <input 
                  type="email"
                  value={groupForm.leader.email}
                  onChange={(e) => setGroupForm({
                    ...groupForm,
                    leader: { ...groupForm.leader, email: e.target.value }
                  })}
                  required
                />
              </div>
            </div>

            <div className={styles.groupSection}>
              <div className={styles.sectionHeader}>
                <h4>Membros do Grupo</h4>
                <div className={styles.cacheButtons}>
                  <button 
                    type="button"
                    onClick={loadMembersFromCache}
                    className={styles.cacheButton}
                    title="Carregar dados salvos anteriormente"
                  >
                    <Download size={16} />
                    Carregar Dados
                  </button>
                  <button 
                    type="button"
                    onClick={clearMembersCache}
                    className={styles.clearButton}
                    title="Limpar dados salvos"
                  >
                    <Trash2 size={16} />
                    Limpar Cache
                  </button>
                  <button 
                    type="button"
                    onClick={addGroupMember}
                    className={styles.addButton}
                  >
                    <Plus size={16} />
                    Adicionar Membro
                  </button>
                </div>
              </div>
              
              {groupForm.members.map((member, index) => (
                <div key={index} className={styles.memberForm}>
                  <div className={styles.memberHeader}>
                    <h5>Membro {index + 1}</h5>
                    <button 
                      type="button"
                      onClick={() => removeGroupMember(index)}
                      className={styles.removeButton}
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Nome Completo</label>
                    <input 
                      type="text"
                      value={member.nome}
                      onChange={(e) => updateGroupMember(index, 'nome', e.target.value)}
                      placeholder="Nome completo do membro"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Data de Nascimento</label>
                    <input 
                      type="date"
                      value={member.dataNascimento}
                      onChange={(e) => updateGroupMember(index, 'dataNascimento', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>CPF</label>
                    <input 
                      type="text"
                      value={member.cpf}
                      onChange={(e) => updateGroupMember(index, 'cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <button 
                type="button"
                onClick={() => setShowGroupForm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={joining}
                className={styles.submitButton}
              >
                {joining ? 'Entrando...' : 'Entrar em Grupo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Clientes na Fila (Bidimensional) */}
      <div className={styles.clientsList}>
        <h3>Fila Bidimensional</h3>
        {Object.keys(groupedClients).length === 0 ? (
          <p className={styles.emptyQueue}>Ninguém na fila ainda</p>
        ) : (
          <div className={styles.bidimensionalQueue}>
            {Object.entries(groupedClients).map(([position, clientsAtPosition]) => (
              <div key={position} className={styles.positionGroup}>
                <div className={styles.positionHeader}>
                  <h4>Posição {position}</h4>
                  <span className={styles.positionCount}>
                    {clientsAtPosition.length} {clientsAtPosition.length === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
                <div className={styles.clientsAtPosition}>
                  {clientsAtPosition.map((client, index) => (
                    <div 
                      key={client.id} 
                      className={`${styles.clientCard} ${client.id === clientPosition?.id ? styles.currentClient : ''} ${client.paidAdvance ? styles.paidClient : ''} ${client.isGroupLeader ? styles.groupLeader : ''}`}
                    >
                      <div className={styles.clientPosition}>
                        <span className={styles.positionNumber}>
                          {position}{client.subPosition || 'a'}
                        </span>
                      </div>
                      <div className={styles.clientInfo}>
                        <h4>{client.nome}</h4>
                        {client.isGroupLeader && (
                          <div className={styles.groupInfo}>
                            <Users size={12} />
                            <span>Líder do grupo ({client.groupSize} pessoas)</span>
                          </div>
                        )}
                        {client.isGroupLeader && client.groupMembers && client.groupMembers.length > 0 && (
                          <div className={styles.groupMembers}>
                            <strong>Membros do grupo:</strong>
                            <ul>
                              {client.groupMembers.map((member, memberIndex) => (
                                <li key={memberIndex}>
                                  {member.nome} {member.email && `(${member.email})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className={styles.clientDetails}>
                          <div className={styles.detailItem}>
                            <Clock size={12} />
                            <span>{calculateEstimatedTime(client.position)} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
