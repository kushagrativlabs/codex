import { useEffect, useRef, useState } from 'react';
import { Channel, invoke, isTauri } from '@tauri-apps/api/core';
import { applyDelta, byteLength, INPUT_BYTES, prepareHistory, type Message, type Model, type StreamEvent } from './chat';

function Icon({ name, size = 18 }: { name: 'plus' | 'arrow' | 'stop' | 'refresh' | 'chat' | 'chip' | 'settings'; size?: number }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m6 12 6-6 6 6M12 6v13" />,
    stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1" /></>,
    chat: <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z" />,
    chip: <><rect x="6" y="6" width="12" height="12" rx="3" /><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" /></>,
    settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const errorText = (error: unknown) => typeof error === 'string' ? error : 'Something went wrong. Please retry.';

export default function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [notice, setNotice] = useState('');
  const [settings, setSettings] = useState(false);
  const active = useRef<{ id: string; cancelled: boolean } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const refreshVersion = useRef(0);

  async function refresh() {
    const version = ++refreshVersion.current;
    setLoading(true); setConnectionError('');
    try {
      if (!isTauri()) throw 'Open the desktop app to connect to Ollama. This browser view is a layout preview.';
      const installed = await invoke<Model[]>('list_models');
      if (version !== refreshVersion.current) return;
      setModels(installed);
      setModel(current => installed.some(item => item.name === current) ? current : '');
    } catch (e) {
      if (version === refreshVersion.current) { setConnectionError(errorText(e)); setModels([]); setModel(''); }
    } finally { if (version === refreshVersion.current) setLoading(false); }
  }
  useEffect(() => {
    void refresh();
    return () => { ++refreshVersion.current; };
  }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, [messages, busy]);

  async function send(text = input) {
    if (active.current || !model || loading || connectionError) return;
    let history;
    try { history = prepareHistory(messages, text); } catch (e) { setError(e instanceof Error ? e.message : errorText(e)); return; }
    const id = crypto.randomUUID();
    const request = { id, cancelled: false };
    active.current = request;
    setBusy(true); setStopping(false); setError(''); setInput('');
    setNotice(history.trimmed ? 'Earlier or incomplete turns were omitted to keep this request within the context budget.' : '');
    setMessages(current => [...current, { id: crypto.randomUUID(), role: 'user', content: text.trim() }, { id, role: 'assistant', content: '', status: 'streaming', model }]);
    const onEvent = new Channel<StreamEvent>();
    onEvent.onmessage = event => {
      if (active.current !== request || request.cancelled) return;
      setMessages(current => applyDelta(current, id, event));
    };
    try {
      const reason = await invoke<string>('chat', { requestId: id, model, messages: history.messages, onEvent });
      if (active.current !== request) return;
      setMessages(current => current.map(message => message.id === id ? { ...message, status: reason === 'cancelled' || request.cancelled ? 'stopped' : 'complete' } : message));
      if (reason === 'length') setNotice('The response reached its output limit. Ask a focused follow-up to continue.');
    } catch (e) {
      if (active.current === request) {
        setError(errorText(e));
        setMessages(current => current.map(message => message.id === id ? { ...message, status: 'error' } : message));
      }
    } finally {
      if (active.current === request) { active.current = null; setBusy(false); setStopping(false); inputRef.current?.focus(); }
    }
  }
  async function stop() {
    const request = active.current;
    if (!request || request.cancelled) return;
    request.cancelled = true; setStopping(true);
    try { await invoke('stop_chat', { requestId: request.id }); }
    catch (e) { request.cancelled = false; setStopping(false); setError(errorText(e)); }
  }
  function newChat() {
    if (active.current) return;
    setMessages([]); setError(''); setNotice(''); setInput(''); inputRef.current?.focus();
  }
  const connected = !loading && !connectionError;
  const disabled = busy || !model || loading || !!connectionError;
  const title = messages.find(message => message.role === 'user')?.content ?? 'New conversation';

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">lc<span>_</span></span><span>Local Code<span className="version">PREVIEW 0.1</span></span></div>
      <button className="new-chat" onClick={newChat} disabled={busy}><Icon name="plus" />New chat<span className="key-hint">↗</span></button>
      <div className="sidebar-label">WORKSPACE</div>
      <button className="nav-item active" onClick={() => setSettings(false)}><Icon name="chat" />Chat<span className="small-tag">01</span></button>
      <div className="sidebar-label conversations-label">THIS SESSION</div>
      <div className="session-title" title={title}><span className="session-dot" />{title}</div>
      <div className="sidebar-bottom">
        <div className="local-card"><span className="local-orbit"><Icon name="chip" /></span><div><strong>Your machine. Your models.</strong><p>Local inference through Ollama</p></div></div>
        <button className="nav-item settings-button" onClick={() => setSettings(current => !current)} aria-expanded={settings}><Icon name="settings" />Connection & details</button>
        <div className="session-note">Chats stay in memory this session.</div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Chat</strong></div><div className="runtime-status"><span className={`status-dot ${connected ? 'online' : ''}`} />{loading ? 'Checking Ollama' : connected ? 'Ollama connected' : 'Ollama unavailable'}<span className="local-badge">LOCAL</span></div></header>
      <div className="model-bar"><div className="model-picker"><Icon name="chip" /><label htmlFor="model" className="sr-only">Select an installed model</label><select id="model" value={model} disabled={busy || loading || !!connectionError} onChange={e => setModel(e.target.value)}><option value="">{loading ? 'Loading models…' : 'Choose a local model'}</option>{models.map(item => <option key={item.name} value={item.name}>{item.name} · {(item.size / 1e9).toFixed(1)} GB</option>)}</select></div><button className="icon-button" title="Refresh installed models" aria-label="Refresh installed models" onClick={() => void refresh()} disabled={busy || loading}><Icon name="refresh" /></button><span className="model-bar-note">No cloud fallback</span></div>
      {settings && <section className="details-panel" aria-label="Connection details"><div><strong>Local connection</strong><p>Ollama at 127.0.0.1:11434 · one response at a time</p><p>2,048-token context request · 512-token output limit · model limits may differ</p><p>History uses a conservative byte budget, not an exact tokenizer. Long histories may be shortened by the app or model runtime.</p></div><button className="text-button" onClick={() => setSettings(false)}>Close</button></section>}
      {connectionError && <div className="connection-banner" role="alert"><strong>Let’s connect your models</strong><p>{connectionError}</p><button className="text-button" disabled={loading} onClick={() => void refresh()}>Retry connection ↗</button></div>}
      {connected && !models.length && <div className="connection-banner" role="status"><strong>No installed models found</strong><p>Add a model using Ollama, then refresh this list. This app does not download models automatically.</p></div>}
      <div className={`conversation ${messages.length ? 'has-messages' : ''}`}>
        {!messages.length ? <section className="welcome"><div className="welcome-symbol"><Icon name="chip" size={28} /></div><div className="eyebrow">A LITTLE MORE LOCAL.</div><h1>A space to think.<br /><span>Powered by your machine.</span></h1><p>Ask a question, untangle an idea, or talk through some code.<br className="desktop-break" /> Pick a model above to begin.</p><div className="suggestions">{['Explain a coding concept', 'Help me plan a small project', 'Talk through a tricky bug'].map((suggestion, i) => <button key={suggestion} disabled={disabled} onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}><span className="suggestion-index">0{i+1}</span>{suggestion}<span className="suggestion-arrow">↗</span></button>)}</div><div className="welcome-footnote"><span className="tiny-dot" />Local chat first. Project tools are coming in later phases.</div></section> : <div className="message-list">{messages.map(message => <article className={`message ${message.role}`} key={message.id}><div className={`avatar ${message.role}`}>{message.role === 'user' ? 'Y' : <Icon name="chip" size={16} />}</div><div className="message-body"><div className="message-label">{message.role === 'user' ? 'You' : message.model || 'Assistant'}{message.status === 'streaming' && <span className="generating-label">{stopping ? 'Stopping…' : 'Responding…'}</span>}</div>{message.thinking && <details className="thinking"><summary>Model reasoning</summary><pre>{message.thinking}</pre></details>}<pre className="message-content">{message.content || (message.status === 'streaming' ? 'Connecting to your model…' : message.status === 'stopped' ? 'Response stopped.' : 'No response text was returned.')}</pre>{message.status === 'stopped' && message.content && <span className="message-state">Stopped · partial response</span>}{message.status === 'error' && <span className="message-state">Incomplete response</span>}</div></article>)}<div ref={bottom} /></div>}
      </div>
      <footer className="composer-area">
        {error && <div className="inline-error" role="alert">{error}<button aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
        {notice && <div className="context-notice" role="status">{notice}</div>}
        <form className={`composer ${busy ? 'working' : ''}`} onSubmit={e => { e.preventDefault(); void send(); }}><label htmlFor="prompt" className="sr-only">Message your local model</label><textarea ref={inputRef} id="prompt" placeholder={model ? 'Message your local model…' : 'Select a model to start a conversation…'} value={input} disabled={busy} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} rows={2} /><div className="composer-controls"><span><Icon name="chip" size={14} />{model || 'No model selected'}</span><div className="send-controls"><span className={`input-count ${byteLength(input) > INPUT_BYTES ? 'over-limit' : ''}`}>{byteLength(input)} / {INPUT_BYTES} B</span>{busy ? <button className="send-button stop-button" type="button" disabled={stopping} aria-label={stopping ? 'Stopping response' : 'Stop response'} onClick={() => void stop()}><Icon name="stop" size={17} /></button> : <button className="send-button" type="submit" disabled={disabled || !input.trim() || byteLength(input) > INPUT_BYTES} aria-label="Send message"><Icon name="arrow" size={20} /></button>}</div></div></form>
        <div className="composer-footnote"><span>Runs on your computer. Responses can be inaccurate.</span><span>Enter to send <span className="footnote-separator">·</span> Shift + Enter for a new line</span></div>
      </footer>
    </main>
  </div>;
}
