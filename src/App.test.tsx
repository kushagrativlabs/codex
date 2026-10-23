// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const native = vi.hoisted(() => ({
  invoke: vi.fn(),
  channel: null as null | { onmessage: (event: { type: 'delta'; content: string; thinking: string }) => void },
}));
vi.mock('@tauri-apps/api/core', () => ({
  isTauri: () => true,
  invoke: native.invoke,
  Channel: class {
    onmessage = () => {};
    constructor() { native.channel = this; }
  },
}));
beforeEach(() => {
  native.invoke.mockReset(); native.channel = null;
  Element.prototype.scrollIntoView = vi.fn();
  native.invoke.mockImplementation((command: string) => command === 'list_models'
    ? Promise.resolve([{ name: 'local:3b', size: 1900000000 }]) : Promise.resolve());
});
afterEach(cleanup);

async function selectAndSend() {
  await screen.findByRole('option', { name: 'local:3b · 1.9 GB' });
  fireEvent.change(screen.getByLabelText('Select an installed model'), { target: { value: 'local:3b' } });
  fireEvent.change(screen.getByLabelText('Message your local model'), { target: { value: 'hello' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
}

describe('desktop chat interaction', () => {
  it('streams safe text, allows only one request, and discards late chunks after stop', async () => {
    let finish!: (value: string) => void;
    native.invoke.mockImplementation((command: string) => {
      if (command === 'list_models') return Promise.resolve([{ name: 'local:3b', size: 1900000000 }]);
      if (command === 'chat') return new Promise<string>(resolve => { finish = resolve; });
      return Promise.resolve();
    });
    const { container } = render(<App />);
    await selectAndSend();
    expect((screen.getByRole('button', { name: /New chat/ }) as HTMLButtonElement).disabled).toBe(true);
    const channel = native.channel!;
    act(() => channel.onmessage({ type: 'delta', content: '<img src=x onerror=alert(1)>', thinking: '' }));
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(container.querySelector('img')).toBeNull();
    fireEvent.keyDown(screen.getByLabelText('Message your local model'), { key: 'Enter' });
    expect(native.invoke.mock.calls.filter(([cmd]) => cmd === 'chat')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Stop response' }));
    act(() => channel.onmessage({ type: 'delta', content: 'LATE', thinking: '' }));
    expect(screen.queryByText(/LATE/)).toBeNull();
    await act(async () => finish('cancelled'));
    expect(screen.getByText('Stopped · partial response')).toBeTruthy();
    act(() => channel.onmessage({ type: 'delta', content: 'AFTER', thinking: '' }));
    expect(screen.queryByText(/AFTER/)).toBeNull();
    expect((screen.getByRole('button', { name: /New chat/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('keeps partial output and presents a failed stream as incomplete', async () => {
    let fail!: (value: string) => void;
    native.invoke.mockImplementation((command: string) => command === 'list_models'
      ? Promise.resolve([{ name: 'local:3b', size: 1900000000 }])
      : new Promise((_resolve, reject) => { fail = reject; }));
    render(<App />); await selectAndSend();
    act(() => native.channel!.onmessage({ type: 'delta', content: 'Partial answer', thinking: '' }));
    await act(async () => fail('Connection interrupted'));
    expect(screen.getByText('Partial answer')).toBeTruthy();
    expect(screen.getByText('Incomplete response')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('Connection interrupted');
  });

  it('offers connection retry and explains an empty installed-model list', async () => {
    native.invoke.mockRejectedValueOnce('Open Ollama first').mockResolvedValueOnce([]);
    render(<App />);
    await screen.findByText('Open Ollama first');
    fireEvent.click(screen.getByRole('button', { name: /Retry connection/ }));
    await screen.findByText('No installed models found');
    await waitFor(() => expect(screen.queryByText('Open Ollama first')).toBeNull());
    expect((screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
