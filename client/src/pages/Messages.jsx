import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Image as ImageIcon, Mic, Square, ArrowLeft, MessageCircle, Loader2, Play, Pause } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Avatar, VerifiedBadge, EmptyState } from '../components/UI';
import { useAuth } from '../services/AuthContext';
import { timeAgo } from '../services/format';
import VideoPlayer from '../components/VideoPlayer';

function AudioBubble({ src, mine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className={`audio-bubble ${mine ? 'mine' : ''}`}>
      <button className="icon-btn small" onClick={toggle}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <span>Mensagem de áudio</span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

function ConversationList({ conversations, loading, activeUsername }) {
  if (loading) {
    return (
      <div className="center-pad">
        <Loader2 className="spin-icon" size={22} />
      </div>
    );
  }
  if (conversations.length === 0) {
    return <EmptyState icon={MessageCircle} title="Nenhuma conversa ainda." subtitle="Envie uma mensagem para um amigo a partir do perfil dele." />;
  }
  return (
    <div className="conversation-list">
      {conversations.map((c) => (
        <Link
          to={`/messages/${c.user.username}`}
          key={c.user._id}
          className={`conversation-row ${activeUsername === c.user.username ? 'active' : ''} ${c.unread ? 'unread' : ''}`}
        >
          <Avatar src={c.user.avatar} name={c.user.name} size={48} />
          <div className="conversation-info">
            <span className="conversation-username">
              {c.user.username}
              {c.user.verified && <VerifiedBadge size={12} />}
            </span>
            <span className="conversation-preview">
              {c.lastMessage.type === 'text'
                ? c.lastMessage.content
                : c.lastMessage.type === 'image'
                ? 'Foto'
                : c.lastMessage.type === 'video'
                ? 'Vídeo'
                : 'Mensagem de áudio'}
            </span>
          </div>
          <div className="conversation-meta">
            <span className="conversation-time">{timeAgo(c.lastMessage.createdAt)}</span>
            {c.unread > 0 && <span className="conversation-badge">{c.unread}</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChatThread({ username, onSent }) {
  const { user: me } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const load = useCallback(() => {
    api
      .get(`/messages/thread/${username}`)
      .then(({ data }) => {
        setOtherUser(data.user);
        setMessages(data.messages);
      })
      .catch((err) => alert(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async (payload, isFile) => {
    setSending(true);
    try {
      const { data } = await api.post(`/messages/thread/${username}`, payload, {
        headers: isFile ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      setMessages((prev) => [...prev, data.message]);
      onSent?.();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleSendText = () => {
    if (!text.trim()) return;
    const formData = new FormData();
    formData.append('type', 'text');
    formData.append('text', text);
    setText('');
    sendMessage(formData, true);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const isVideo = f.type.startsWith('video/');
    const formData = new FormData();
    formData.append('type', isVideo ? 'video' : 'image');
    formData.append('file', f);
    sendMessage(formData, true);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('type', 'audio');
        formData.append('file', blob, 'audio.webm');
        sendMessage(formData, true);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  if (loading) {
    return (
      <div className="center-pad" style={{ flex: 1 }}>
        <Loader2 className="spin-icon" size={22} />
      </div>
    );
  }

  return (
    <div className="chat-thread">
      <div className="chat-thread-header">
        <Link to="/messages" className="icon-btn chat-back">
          <ArrowLeft size={20} />
        </Link>
        {otherUser && (
          <Link to={`/profile/${otherUser.username}`} className="chat-thread-user">
            <Avatar src={otherUser.avatar} name={otherUser.name} size={36} />
            <span>
              {otherUser.username}
              {otherUser.verified && <VerifiedBadge size={12} />}
            </span>
          </Link>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <EmptyState title="Nenhuma mensagem ainda." subtitle="Diga olá para começar a conversa." />
        ) : (
          messages.map((m) => {
            const mine = m.sender === me.id;
            return (
              <div key={m._id} className={`chat-bubble-row ${mine ? 'mine' : ''}`}>
                {m.type === 'text' && <div className={`chat-bubble ${mine ? 'mine' : ''}`}>{m.content}</div>}
                {m.type === 'image' && (
                  <div className={`chat-bubble chat-bubble-media ${mine ? 'mine' : ''}`}>
                    <img src={m.content} alt="" />
                  </div>
                )}
                {m.type === 'video' && (
                  <div className={`chat-bubble chat-bubble-media ${mine ? 'mine' : ''}`}>
                    <VideoPlayer src={m.content} className="chat-bubble-video-el" />
                  </div>
                )}
                {m.type === 'audio' && <AudioBubble src={m.content} mine={mine} />}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-composer">
        <button className="icon-btn" onClick={() => fileRef.current?.click()} disabled={sending || recording}>
          <ImageIcon size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
          hidden
          onChange={handleFile}
        />
        <input
          className="input"
          placeholder={recording ? 'Gravando áudio...' : 'Escreva uma mensagem...'}
          value={text}
          disabled={recording}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
        />
        {text.trim() ? (
          <button className="icon-btn primary" onClick={handleSendText} disabled={sending}>
            <Send size={16} />
          </button>
        ) : (
          <button
            className={`icon-btn ${recording ? 'recording' : 'primary'}`}
            onClick={recording ? stopRecording : startRecording}
            disabled={sending}
          >
            {recording ? <Square size={16} /> : <Mic size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const { username } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(() => {
    api
      .get('/messages/conversations')
      .then(({ data }) => setConversations(data.conversations))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 6000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  return (
    <div className="messages-page">
      <div className={`messages-sidebar ${username ? 'hide-mobile' : ''}`}>
        <div className="messages-sidebar-header">
          <h2 className="page-title">Mensagens</h2>
        </div>
        <div className="conversation-scroll">
          <ConversationList conversations={conversations} loading={loading} activeUsername={username} />
        </div>
      </div>
      <div className={`messages-thread-wrap ${!username ? 'hide-mobile' : ''}`}>
        {username ? (
          <ChatThread username={username} onSent={loadConversations} />
        ) : (
          <EmptyState icon={MessageCircle} title="Selecione uma conversa" subtitle="Escolha um amigo na lista para começar a conversar." />
        )}
      </div>
    </div>
  );
}
