import { describe, expect, it } from 'vitest';
import { applyDelta, byteLength, prepareHistory, type Message } from './chat';
const turn = (text: string, status: Message['status'] = 'complete'): Message[] => [
  { id: 'u', role: 'user', content: text }, { id: 'a', role: 'assistant', content: text, status },
];
describe('context preparation', () => {
  it('retains roles in complete turns and appends the newest user input', () => {
    expect(prepareHistory(turn('hello'), ' next ').messages).toEqual([
      { role: 'user', content: 'hello' }, { role: 'assistant', content: 'hello' }, { role: 'user', content: 'next' },
    ]);
  });
  it('drops complete oldest turns when the UTF-8 budget is exceeded', () => {
    const result = prepareHistory([...turn('x'.repeat(2048)), ...turn('recent')], 'hello');
    expect(result.trimmed).toBe(true);
    expect(result.messages[0].content).toBe('recent');
    expect(result.messages.length).toBe(3);
  });
  it('does not send a stopped or failed answer back as a complete assistant turn', () => {
    for (const state of ['stopped', 'error', 'streaming'] as const) {
      expect(prepareHistory(turn('partial', state), 'next').messages).toEqual([{ role: 'user', content: 'next' }]);
    }
  });
  it('uses UTF-8 bytes rather than JavaScript string length', () => {
    expect(byteLength('é')).toBe(2);
    expect(() => prepareHistory([], 'é'.repeat(1025))).toThrow('too long');
    expect(() => prepareHistory([], '   ')).toThrow('Enter a message');
  });
});
it('ignores late stream chunks for completed messages or a different request', () => {
  const messages = turn('answer');
  expect(applyDelta(messages, 'a', { type: 'delta', content: 'late', thinking: '' })).toEqual(messages);
  expect(applyDelta(turn('', 'streaming'), 'old', { type: 'delta', content: 'late', thinking: '' })[1].content).toBe('');
  expect(applyDelta(turn('', 'streaming'), 'a', { type: 'delta', content: 'new', thinking: 'reason' })[1]).toMatchObject({ content: 'new', thinking: 'reason' });
});
