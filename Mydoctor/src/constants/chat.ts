import { v4 as uuidv4 } from 'uuid';
import { ChatInterface, ConfigInterface, ModelOptions } from '@type/chat';
import useStore from '@store/store';

const date = new Date();
const dateString =
  date.getFullYear() +
  '-' +
  ('0' + (date.getMonth() + 1)).slice(-2) +
  '-' +
  ('0' + date.getDate()).slice(-2);

// default system message obtained using the following method: https://twitter.com/DeminDimin/status/1619935545144279040
export const _defaultSystemMessage =
  import.meta.env.VITE_DEFAULT_SYSTEM_MESSAGE ?? ``; //Welcome to PlatformAI, where guidance and support are at your fingertips. Choose from our three specialized virtual companions: Doctor, Mentor, and ChristianGPT (Mormon). Each one is tailored to provide you with insights and assistance unique to their field of expertise. Whether you seek health advice, personal development guidance, or spiritual understanding, your journey towards enrichment starts here. Please select your companion to begin.

export const modelOptions: ModelOptions[] = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-4',
  'gpt-4-32k',
  'gpt-4-1106-preview',
  // 'gpt-3.5-turbo-0301',
  // 'gpt-4-0314',
  // 'gpt-4-32k-0314',
];

export const defaultModel = 'gpt-3.5-turbo';

export const modelMaxToken = {
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-0301': 4096,
  'gpt-3.5-turbo-0613': 4096,
  'gpt-3.5-turbo-16k': 16384,
  'gpt-3.5-turbo-16k-0613': 16384,
  'gpt-4': 8192,
  'gpt-4-0314': 8192,
  'gpt-4-0613': 8192,
  'gpt-4-32k': 32768,
  'gpt-4-32k-0314': 32768,
  'gpt-4-32k-0613': 32768,
  'gpt-4-1106-preview': 128000,
};

export const modelCost = {
  'gpt-3.5-turbo': {
    prompt: { price: 1, unit: 1000 },
    completion: { price: 1, unit: 1000 },
  },
  'gpt-3.5-turbo-0301': {
    prompt: { price: 1, unit: 1000 },
    completion: { price: 1, unit: 1000 },
  },
  'gpt-3.5-turbo-0613': {
    prompt: { price: 1, unit: 1000 },
    completion: { price: 1, unit: 1000 },
  },
  'gpt-3.5-turbo-16k': {
    prompt: { price: 1, unit: 1000 },
    completion: { price: 1, unit: 1000 },
  },
  'gpt-3.5-turbo-16k-0613': {
    prompt: { price: 1, unit: 1000 },
    completion: { price: 1, unit: 1000 },
  },
  'gpt-4': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
  'gpt-4-0314': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
  'gpt-4-0613': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
  'gpt-4-32k': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
  'gpt-4-32k-0314': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
  'gpt-4-32k-0613': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
  'gpt-4-1106-preview': {
    prompt: { price: 16, unit: 1000 },
    completion: { price: 16, unit: 1000 },
  },
};

export const defaultUserMaxToken = 4000;

export const _defaultChatConfig: ConfigInterface = {
  model: defaultModel,
  max_tokens: defaultUserMaxToken,
  temperature: 1,
  presence_penalty: 0,
  top_p: 1,
  frequency_penalty: 0,
};

export const generateDefaultChat = (
  title?: string,
  folder?: string
): ChatInterface => ({
  id: uuidv4(),
  title: title ? title : 'New Chat',
  messages:
    useStore.getState().defaultSystemMessage.length > 0
      ? [{ role: 'system', content: useStore.getState().defaultSystemMessage }]
      : [],
  config: { ...useStore.getState().defaultChatConfig },
  titleSet: false,
  folder,
});

export const generateDefaultChatWithTitle = (title: string): ChatInterface => {
  const defaultSystemMessage = useStore.getState().defaultSystemMessage;
  const defaultChatConfig = useStore.getState().defaultChatConfig;

  return {
    id: uuidv4(),
    title: title,
    messages:
      defaultSystemMessage.length > 0
        ? [{ role: 'system', content: defaultSystemMessage }]
        : [],
    config: { ...defaultChatConfig },
    titleSet: true, // Assuming the title is set since it's being passed as an argument
    folder: undefined, // Adjust as needed or add as a parameter if required
  };
};
export const codeLanguageSubset = [
  'python',
  'javascript',
  'java',
  'go',
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'graphql',
  'json',
  'kotlin',
  'less',
  'lua',
  'makefile',
  'markdown',
  'objectivec',
  'perl',
  'php',
  'php-template',
  'plaintext',
  'python-repl',
  'r',
  'ruby',
  'rust',
  'scss',
  'shell',
  'sql',
  'swift',
  'typescript',
  'vbnet',
  'wasm',
  'xml',
  'yaml',
];
