export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  model?: string;
  status?: 'streaming' | 'complete' | 'stopped' | 'error';
}
export interface WireMessage { role: 'user' | 'assistant'; content: string }
export interface Model { name: string; size: number }
export type StreamEvent = { type: 'delta'; content: string; thinking: string };
export const HISTORY_BYTES = 4096;
export const INPUT_BYTES = 2048;
export const byteLength = (text: string) => new TextEncoder().encode(text).length;

// Retain whole completed turns. Partial or failed replies never enter future context.
export function prepareHistory(messages: Message[], input: string) {
  if (!input.trim()) throw new Error('Enter a message first.');
  if (byteLength(input) > INPUT_BYTES) throw new Error('Message is too long. Keep it under 2 KB for this initial version.');
  const result: WireMessage[] = [{ role: 'user', content: input.trim() }];
  let bytes = byteLength(input.trim());
  let included = 0;
  for (let i = messages.length - 2; i >= 0; i -= 2) {
    const user = messages[i]; const assistant = messages[i + 1];
    if (!user || !assistant || user.role !== 'user' || assistant.role !== 'assistant') break;
    if (assistant.status !== 'complete' || !assistant.content.trim()) break;
    const pairBytes = byteLength(user.content) + byteLength(assistant.content);
    if (bytes + pairBytes > HISTORY_BYTES || result.length + 2 > 31) break;
    result.unshift({ role: 'user', content: user.content }, { role: 'assistant', content: assistant.content });
    bytes += pairBytes; included += 2;
  }
  return { messages: result, trimmed: included < messages.length };
}

export function applyDelta(messages: Message[], id: string, event: StreamEvent): Message[] {
  return messages.map(message => message.id === id && message.status === 'streaming'
    ? { ...message, content: message.content + event.content, thinking: (message.thinking ?? '') + event.thinking }
    : message);
}
