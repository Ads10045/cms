import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Relative path — frontend and backend are served on the same origin via Cloudflare tunnel
const API_URL = '/api';

// Always send cookies (JWT httpOnly) with every axios request
axios.defaults.withCredentials = true;

// Socket instance — created lazily after login so the cookie is present
let socket = null;
const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      withCredentials: true, // send httpOnly cookie for auth
    });
  }
  return socket;
};

// Helper to log to backend
const logToBackend = async (level, message, stack = '') => {
  try {
    await axios.post(`${API_URL}/logs`, { level, message, stack });
  } catch (error) {
    console.error('Failed to send log to backend:', error);
  }
};

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
      onAuthSuccess(res.data);
      logToBackend('info', `User ${username} successfully ${isLogin ? 'logged in' : 'registered'}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Une erreur est survenue';
      setError(msg);
      logToBackend('error', `Auth failed for ${username}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-white/20 mb-8">
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        {isLogin ? 'Connexion Sécurisée' : 'Créer un Compte'}
      </h2>
      
      {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/30">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200/50 outline-none transition-all"
            placeholder="Votre pseudo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200/50 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Chargement...' : isLogin ? 'Se Connecter' : "S'inscrire"}
        </button>
      </form>
      
      <p className="text-center text-blue-200 text-sm mt-6">
        {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-white font-semibold hover:underline"
        >
          {isLogin ? "Créer un compte" : "Se connecter"}
        </button>
      </p>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Auth state
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check auth session on mount
  useEffect(() => {
    logToBackend('info', 'Frontend application started');
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  // Init socket + fetch messages once user is authenticated
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages`);
        setMessages(res.data.reverse());
      } catch (err) {
        setError('Erreur lors du chargement des messages');
        logToBackend('error', 'Error loading messages', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Socket — cookie httpOnly is sent automatically via withCredentials
    const s = getSocket();
    s.connect();

    s.on('connect', () => setSocketConnected(true));
    s.on('disconnect', () => setSocketConnected(false));
    s.on('connect_error', (err) => {
      logToBackend('error', `Socket connection error: ${err.message}`);
    });

    s.on('message_created', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 100);
    });
    s.on('message_updated', (updatedMsg) => {
      setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
    });
    s.on('message_deleted', ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('connect_error');
      s.off('message_created');
      s.off('message_updated');
      s.off('message_deleted');
      s.disconnect();
      socket = null; // reset so next login gets a fresh instance
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
      logToBackend('info', `User logged out`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      await axios.post(`${API_URL}/messages`, { content: newMessage });
      setNewMessage('');
      logToBackend('info', `User ${user.username} posted a new message`);
    } catch (err) {
      logToBackend('error', 'Failed to send message', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await axios.delete(`${API_URL}/messages/${id}`);
      logToBackend('info', `User ${user.username} deleted message ID: ${id}`);
    } catch (err) {
      alert("Erreur: Vous n'avez pas le droit de supprimer ce message.");
      logToBackend('error', `Failed to delete message ${id}`, err.message);
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim() || !user) return;
    try {
      await axios.put(`${API_URL}/messages/${id}`, { content: editContent });
      setEditingId(null);
      setEditContent('');
      logToBackend('info', `User ${user.username} updated message ID: ${id}`);
    } catch (err) {
      alert("Erreur: Vous n'avez pas le droit de modifier ce message.");
      logToBackend('error', `Failed to update message ${id}`, err.message);
    }
  };

  if (authChecking) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
              LiveChat Secure
            </h1>
            <div title={socketConnected ? "Temps Réel Actif" : "Déconnecté"}>
              <span className={`flex h-4 w-4 relative`}>
                {socketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-4 w-4 ${socketConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
            </div>
          </div>
          <p className="text-blue-200 text-lg">Communication temps réel cryptée</p>
          
          {user && (
            <div className="mt-4 flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full border border-white/10">
              <span className="text-emerald-400 font-medium">
                👤 {user.username} {user.role === 'admin' && <span title="Administrateur">👑</span>}
              </span>
              <button onClick={handleLogout} className="text-red-300 hover:text-red-400 text-sm font-semibold transition">
                Déconnexion
              </button>
            </div>
          )}
        </header>

        {!user ? (
          <AuthForm onAuthSuccess={setUser} />
        ) : (
          <>
            {/* Input Form */}
            <form onSubmit={handleCreate} className="mb-8 relative z-10">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez un message sécurisé..."
                  className="flex-1 bg-transparent px-4 py-3 text-white placeholder-blue-200/50 outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Envoyer ✨
                </button>
              </div>
            </form>
          </>
        )}

        {/* Message List */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-4 md:p-8 min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center flex-1 mt-10">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-blue-200/50 text-center flex-1 flex items-center justify-center italic">
              Aucun message pour le moment. Soyez le premier !
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {messages.map((msg) => {
                const isOwner = user && (msg.user_id === user.id || user.role === 'admin');
                const isRealOwner = user && msg.user_id === user.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`group flex items-start gap-4 p-4 rounded-2xl transition-all hover:bg-white/5 ${isRealOwner ? 'bg-blue-900/20 border border-blue-500/20' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`font-bold ${isOwner ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {msg.username || 'Anonyme'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {editingId === msg.id ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 bg-slate-800/50 text-white px-3 py-2 rounded-lg border border-blue-500/30 focus:border-blue-400 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(msg.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
                          >
                            💾
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-200 break-words leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    
                    {/* Action Buttons (Only visible to owner) */}
                    {isOwner && editingId !== msg.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button
                          onClick={() => startEdit(msg)}
                          className="p-2 text-blue-300 hover:text-blue-100 hover:bg-blue-500/20 rounded-lg transition"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-2 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
