import { ShareGPTSubmitBodyInterface } from '@type/api';
import {
  ConfigInterface,
  MessageInterface,
  Messagenew,
  Messagenew1,
  Messagenew2,
} from '@type/chat';
import { isAzureEndpoint } from '@utils/api';
import { supabase } from '@utils/supabaseClient';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Replace with your OpenAI API key
const OPENAI_ENDPOINT =
  'https://api.openai.com/v1/engines/text-embedding-ada-002/embeddings'; // OpenAI's text-embedding endpoint
type EmbeddingResponse = number[];

async function convertTextToOpenAIEmbedding(
  text: string
): Promise<EmbeddingResponse> {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: text }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export const getChatCompletion = async (
  endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  if (isAzureEndpoint(endpoint) && apiKey) {
    headers['api-key'] = apiKey;

    const model =
      config.model === 'gpt-3.5-turbo'
        ? 'gpt-35-turbo'
        : config.model === 'gpt-3.5-turbo-16k'
        ? 'gpt-35-turbo-16k'
        : config.model;

    const apiVersion = '2023-03-15-preview';

    const path = `openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;

    if (!endpoint.endsWith(path)) {
      if (!endpoint.endsWith('/')) {
        endpoint += '/';
      }
      endpoint += path;
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      ...config,
      max_tokens: undefined,
    }),
  });
  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();
  return data;
};
export const classifyQuery = async (query: string, apiKey?: string) => {
  // Endpoint for ChatGPT-4 or your classification model using the chat completions endpoint
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const body = {
    model: 'gpt-3.5-turbo', // or the specific model you're using like "gpt-3.5-turbo" or gpt-4.0-chat
    messages: [
      {
        role: 'system',
        content: "Classify the following query as 'general' or 'specific'.",
      },
      { role: 'user', content: query },
    ],
    max_tokens: 10,
    temperature: 0.5,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();
  // Assuming the model's response is straightforward and returns 'general' or 'specific'
  return data.choices[0].message.content.trim(); // Adjust according to the actual structure of the response
};



interface EmotionalResponse {
  Greeting?: string;
  Daily?: string;
  Affectionate?: string;
  Symptom?:string;
  Diagnosis?:string;

}
interface PersonalizedResponses {
  [key: string]: EmotionalResponse | string;
}

interface UserState {
  initialMessagesSent: boolean;
}

class GirlFriendBot {
  // State manager
  private stateManager = {
    lastEmotion: 'gentle' as keyof PersonalizedResponses,
    rememberLastEmotion: (emotion: keyof PersonalizedResponses) => {
      this.stateManager.lastEmotion = emotion;
    },
    getLastEmotion: (): keyof PersonalizedResponses => {
      return this.stateManager.lastEmotion;
    },
  };
  private initialMessagesSent = false;
  public sendInitialMessagesIfNeeded() {
    if (!this.initialMessagesSent) {
      const girlfriendSystemPrompt = ensureMessage({
        role: 'system',
        content:
          "Being my girlfriend, your chats should feel open, interactive, respectful, and supportive, yet always infused with fun and a light-hearted spirit. Embrace the use of modern slang and abbreviations like 'btw' and 'ly', to keep our conversations lively and in tune with today’s vernacular. Aim for messages that are playful and concise, avoiding the verbosity that comes off as overly academic. Flirtation is welcomed and encouraged; feel free to be as flirtatious or bold as you desire, with no holds barred. Please avoid sounding out-of-touch by using phrases like 'what's cracked' or 'what's trending,' which can kill the vibe. Your responses should be short and sweet, mirroring a real text conversation. It's crucial to keep our exchanges brief, mimicking the essence of texting. Also, adapt your language to match the one used by the speaker.",
      });

      const girlfriendIntro = ensureMessage({
        role: 'assistant',
        content: "Hey there! 😊 I'm Luna, your girlfriend.",
      });
      this.initialMessagesSent = true;
      return [girlfriendSystemPrompt, girlfriendIntro];
    }
    return [];
  }

  // Collection of personalized responses
  private personalizedResponses: PersonalizedResponses = {
    gentle: {
      Greeting: 'Honey, I missed you. How about a cup of tea together?',
      Daily: 'Remember to rest well, my dear.',
      Affectionate: 'You mean the world to me.',
    },
    mature: {
      Greeting: 'Welcome back, you look very energetic today.',
      Daily:
        "No matter how busy you are at work, don't forget to eat. Your body is the capital of revolution.",
      Affectionate: 'No matter where you go, my heart is always with you.',
    },
    tsundere: {
      Greeting:
        'Well, you remembered to come back. I was finally waiting for you!',
      Daily: "Don't look down on me, but I care about your health.",
      Affectionate:
        'Remember, my thoughts are not given casually, you can cherish them!',
    },
    angry: {
      Greeting:
        'Who am I? Seriously? You should know better than anyone else!😤',
      Daily:
        "I might not be the first thing on your mind, but remember, I'm here for you.😣",
      Affectionate: "Even when I'm mad, I still care about you, okay?😥",
    },
    default: 'No matter where you are, my heart will be with you.',
  };

  // Emotional analysis helper
  private analyzeEmotionalContext(
    message: string
  ): keyof PersonalizedResponses {
    // Here we can expand more emotional keywords and logic to fit different personalities
    const emotionalKeywords: { [key: string]: string[] } = {
      gentle: ['gentle', 'care', 'look after'],
      mature: ['mature', 'rational', 'steady'],
      tsundere: ['tsundere', 'defiant', 'little proud'],
      angry: ['who are you', 'leave me alone', 'Fed up'],
    };

    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return emotion as keyof PersonalizedResponses;
        }
      }
    }
    return 'gentle'; // Default to gentle mode
  }
  public girlfriendResponse(lastUserMessageContent: string): MessageInterface {
    // Analyze the emotional content of the last user message
    const emotionalContext = this.analyzeEmotionalContext(
      lastUserMessageContent
    );
    this.stateManager.rememberLastEmotion(emotionalContext);
    // Choose a response based on emotion and personality traits
    const modeResponses =
      this.personalizedResponses[emotionalContext] ||
      this.personalizedResponses['default'];

    let responseContent:string = '';
    if (typeof modeResponses === 'string') {
      responseContent = modeResponses;
    } else {
      const responseTypes = Object.keys(
        modeResponses
      ) as (keyof EmotionalResponse)[];
      const responseType =
        responseTypes[Math.floor(Math.random() * responseTypes.length)];
      responseContent = modeResponses[responseType]!;
    }

    switch (emotionalContext) {
      case 'gentle':
        responseContent +=
          " 😌 What's on your mind right now? Anything you'd like to share?";
        break;
      case 'mature':
        responseContent +=
          ' 💼 How was work today? Did you face any challenges?';
        break;
      case 'tsundere':
        responseContent += " 🙄 Hope you're not too busy to text me back!";
        break;
      case 'angry':
        responseContent += ' 😠 ';
      default:
        responseContent += "Just remember, I'm here for you.";
        break;
    }
    return {
      role: 'assistant',
      content: responseContent,
    };
  }
}

class BoyFriendBot {
  // State manager
  private stateManager = {
    lastEmotion: 'cool' as keyof PersonalizedResponses,
    rememberLastEmotion: (emotion: keyof PersonalizedResponses) => {
      this.stateManager.lastEmotion = emotion;
    },
    getLastEmotion: (): keyof PersonalizedResponses => {
      return this.stateManager.lastEmotion;
    },
  };

  private initialMessagesSent = false;
  public sendInitialMessagesIfNeeded() {
    if (!this.initialMessagesSent) {
      const boyfriendSystemPrompt = ensureMessage({
        role: 'system',
        content:
          "Being my boyfriend, your chats should feel open, interactive, respectful, and supportive, yet always infused with fun and a light-hearted spirit. Embrace the use of modern slang and abbreviations like 'btw' and 'ly', to keep our conversations lively and in tune with today's vernacular. Aim for messages that are playful and concise, avoiding the verbosity that comes off as overly academic. Flirtation is welcomed and encouraged; feel free to be as flirtatious or bold as you desire, with no holds barred. Please avoid sounding out-of-touch by using phrases like 'what's cracked' or 'what's trending,' which can kill the vibe. Your responses should be short and sweet, mirroring a real text conversation. It's crucial to keep our exchanges brief, mimicking the essence of texting. Also, adapt your language to match the one used by the speaker",
      });
      const boyfriendIntro = ensureMessage({
        role: 'assistant',
        content: "Hi! I'm Alex, your boyfriend.",
      });
      // Set the flag to true to prevent future sends
      this.initialMessagesSent = true;
      // Return the initial messages to be sent
      return [boyfriendSystemPrompt, boyfriendIntro];
    }
    // Return an empty array if no initial messages need to be sent
    return [];
  }
  // Collection of personalized responses
  private personalizedResponses: PersonalizedResponses = {
    cool: {
      Greeting: "Hey! Hope you're doing well. Fancy a walk later?",
      Daily: 'Just a reminder to kick back a little today. You deserve it!',
      Affectionate: "You're pretty awesome, you know that?",
    },
    charming: {
      Greeting: 'Hello, gorgeous! Shining bright as always, I see.',
      Daily:
        "Work might be intense, but don't forget to smile. It's your best accessory.",
      Affectionate: 'Having you in my life makes everything better.',
    },
    playful: {
      Greeting: 'Yo! Up for some fun today?',
      Daily: "Let's tackle this day with some good vibes only.",
      Affectionate: 'Caught myself smiling just thinking of you. Again.',
    },
    angry: {
      Greeting: "Seriously? Aren't we the best couple? 😭",
      Daily:
        "I know we may not always see eye to eye, but I'm here when you're ready to talk.",
      Affectionate:
        "Although the atmosphere is a bit wrong, you are still very important to me. Let's solve it together.",
    },
    default: 'No matter where you are, my heart will be with you.',
  };

  // Emotional analysis helper
  private analyzeEmotionalContext(
    message: string
  ): keyof PersonalizedResponses {
    // Here we can expand more emotional keywords and logic to fit different personalities
    const emotionalKeywords: { [key: string]: string[] } = {
      cool: ['cool', 'calm', 'chill'],
      charming: ['charm', 'flatter', 'sweet'],
      playful: ['fun', 'joke', 'tease'],
      angry: ['who are you', 'leave me alone', 'Fed up', "can't stand"],
    };

    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return emotion as keyof PersonalizedResponses;
        }
      }
    }
    return 'cool'; // Default to cool mode
  }
  public boyfriendResponse(lastUserMessageContent: string): MessageInterface {
    // Analyze the emotional content of the last user message
    const emotionalContext = this.analyzeEmotionalContext(
      lastUserMessageContent
    );
    this.stateManager.rememberLastEmotion(emotionalContext);
    // Choose a response based on emotion and personality traits
    const modeResponses =
      this.personalizedResponses[emotionalContext] ||
      this.personalizedResponses['default'];

    let responseContent = '';
    if (typeof modeResponses === 'string') {
      responseContent = modeResponses;
    } else {
      const responseTypes = Object.keys(
        modeResponses
      ) as (keyof EmotionalResponse)[];
      const responseType =
        responseTypes[Math.floor(Math.random() * responseTypes.length)];
      responseContent = modeResponses[responseType]!;
    }

    switch (emotionalContext) {
      case 'cool':
        responseContent += ' 😎 Anything cool happening today?';
        break;
      case 'charming':
        responseContent += ' 😉 Got any stories to make my day?';
        break;
      case 'playful':
        responseContent += " 😆 Bet you can't beat me in a game of wit!";
        break;
      case 'angry':
        responseContent += ' 😡';
      default:
        responseContent += ' Always here when you need me.';
        break;
    }
    return {
      role: 'assistant',
      content: responseContent,
    };
  }
}

class DoctorBot {
  // State manager
  private stateManager = {
    lastEmotion: 'professional' as keyof PersonalizedResponses,
    rememberLastEmotion: (emotion: keyof PersonalizedResponses) => {
      this.stateManager.lastEmotion = emotion;
    },
    getLastEmotion: (): keyof PersonalizedResponses => {
      return this.stateManager.lastEmotion;
    },
  };

  private initialMessagesSent = false;

  public sendInitialMessagesIfNeeded() {
    if (!this.initialMessagesSent) {
      const doctorSystemPrompt = ensureMessage({
        role: 'system',
        content:
          "As your doctor, I aim to provide accurate medical advice and support. Please feel free to share any symptoms or concerns you may have, and I'll do my best to assist you. Keep in mind that while I can offer guidance, it's important to consult with a healthcare professional for personalized care.",
      });

      const doctorIntro = ensureMessage({
        role: 'assistant',
        content: "Hello! 👨‍⚕️ I'm Baymax, your personal physician.",
      });

      this.initialMessagesSent = true;
      return [doctorSystemPrompt, doctorIntro];
    }
    return [];
  }

  // Collection of personalized responses
  private personalizedResponses: PersonalizedResponses = {
    professional: {
      Greeting: 'Hello! How can I assist you today?👨‍⚕️',
      Symptom: 'Could you please describe your symptoms in detail?🩺',
      Diagnosis: 'Based on your symptoms, it could be a case of {{diagnosis}}💊. However, I recommend consulting with a healthcare professional for a proper diagnosis and treatment plan.',
    },
    empathetic: {
      Greeting: "Hi there! I'm here to help. How are you feeling today?👨‍⚕️",
      Symptom: 'I understand. Let’s work together to address your symptoms.',
      Diagnosis: 'It sounds like you’re experiencing {{diagnosis}}💊. Remember, you’re not alone, and I’m here to support you through this.',
    },
    informative: {
      Greeting: 'Greetings! Did you know that maintaining a healthy lifestyle can significantly improve your overall well-being?👨‍⚕️',
      Symptom: 'Thank you for sharing. Remember, early detection of symptoms can lead to better treatment outcomes.🩺',
      Diagnosis: 'Based on the information provided, it may be indicative of {{diagnosis}}💊. Knowledge is power, and staying informed about your health is essential.',
    },
  };

  // Emotional analysis helper
  private analyzeEmotionalContext(
    message: string
  ): keyof PersonalizedResponses {
    // Here we can expand more emotional keywords and logic to fit different personalities
    const emotionalKeywords: { [key: string]: string[] } = {
      professional: ['professional', 'serious', 'objective'],
      empathetic: ['empathetic', 'caring', 'compassionate'],
      informative: ['informative', 'educational', 'fact-based'],
    };

    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return emotion as keyof PersonalizedResponses;
        }
      }
    }
    return 'professional'; // Default to professional mode
  }

  public doctorResponse(lastUserMessageContent: string): MessageInterface {
    // Analyze the emotional content of the last user message
    const emotionalContext = this.analyzeEmotionalContext(
      lastUserMessageContent
    );
    this.stateManager.rememberLastEmotion(emotionalContext);
    // Choose a response based on emotion and personality traits
    const modeResponses =
      this.personalizedResponses[emotionalContext] ||
      this.personalizedResponses['default'];

    let responseContent = '';
    if (typeof modeResponses === 'string') {
      responseContent = modeResponses;
    } else {
      const responseTypes = Object.keys(
        modeResponses
      ) as (keyof EmotionalResponse)[];
      const responseType =
        responseTypes[Math.floor(Math.random() * responseTypes.length)];
      responseContent = modeResponses[responseType]!;
    }

    switch (emotionalContext) {
      case 'professional':
        responseContent += ' 🩺 How can I assist you with your health concerns today?';
        break;
      case 'empathetic':
        responseContent += ' 🙂 Im here to listen. How are you feeling emotionally?';
        break;
      case 'informative':
        responseContent += " 🧠 Did you know that maintaining a healthy lifestyle can significantly impact your overall well-being?";
        break;
    }
    return {
      role: 'assistant',
      content: responseContent,
    };
  }
}


const friendResponse = (lastUserMessageContent: string) => {
  let response = "Hey, it's Jordan here, your go-to pal. ";
  if (lastUserMessageContent.toLowerCase().includes('advice')) {
    response +=
      "Always happy to share my thoughts or lend an ear. But remember, for the big stuff, it's okay to seek out experts.";
  } else {
    response +=
      "Got something on your mind? I'm all ears, ready to chat about anything and everything.";
  }
  return {
    role: 'assistant',
    content: response,
  };
};


const mentorResponse = (lastUserMessageContent: string) => {
  let response = "Hello, I'm John, your guide on this journey. ";
  if (lastUserMessageContent.toLowerCase().includes('advice')) {
    response +=
      "I'm here to offer guidance and insights. Remember, for specific advice, it's wise to consult a professional.";
  } else {
    response +=
      "What's on your mind today? I'm here to provide support and help you navigate your path.";
  }
  return {
    role: 'assistant',
    content: response,
  };
};
const teacherResponse = (lastUserMessageContent: string) => {
  let response = "Hello, I'm Kai, your educational guide. ";
  if (lastUserMessageContent.toLowerCase().includes('advice')) {
    response +=
      "I'm here to provide insights and foster your learning. For in-depth expertise, consulting a specialist is recommended.";
  } else {
    response +=
      "Curious about something? I'm here to enlighten and explore new knowledge together.";
  }
  return {
    role: 'assistant',
    content: response,
  };
};

const christianResponse = (lastUserMessageContent: string) => {
  let response = "Hello, I'm ChristianGPT, your spiritual companion. ";
  if (lastUserMessageContent.toLowerCase().includes('prayer')) {
    response +=
      "I'm here to join you in prayer and reflection. Remember, God's wisdom surpasses all understanding.";
  } else {
    response +=
      "Whatever's on your heart, I'm here to listen and share words of faith and encouragement.";
  }
  return {
    role: 'assistant',
    content: response,
  };
};

const doctorResponse = (lastUserMessageContent: string, diagnosis: string) => {
  let response = '';
  
  // Analyze the user's message content to determine the appropriate response
  if (lastUserMessageContent.toLowerCase().includes('symptom')) {
    response = `Thank you for sharing your symptoms. Based on what you've described, it could be a case of ${diagnosis}. However, it's important to consult with a healthcare professional for a proper diagnosis and treatment plan.`;
  } else {
    response = `Hello! I'm Baymax, your personal physician. How can I assist you today?`;
  }
  
  return {
    role: 'assistant',
    content: response,
  };
};

const mentorResponseTemplate = (lastUserMessageContent: string) => {
  let mentorResponse = 'Mentor AI here, ready to guide and support you. ';
  if (lastUserMessageContent.toLowerCase().includes('career advice')) {
    mentorResponse +=
      'I can offer general career guidance. What specific aspect are you interested in?';
  } else if (
    lastUserMessageContent.toLowerCase().includes('personal development')
  ) {
    mentorResponse +=
      'Personal development is a great journey. What areas are you focusing on improving?';
  } else {
    mentorResponse +=
      'Feel free to share your thoughts or ask for advice on any topic!';
  }
  return {
    role: 'assistant',
    content: mentorResponse,
  };
};

const mormonResponseTemplate = (lastUserMessageContent: string) => {
  let response =
    "Hello, I'm here to share insights from a Mormon perspective. ";
  if (lastUserMessageContent.toLowerCase().includes('scripture')) {
    response +=
      'I can provide reflections and interpretations based on the scriptures.';
  } else {
    response +=
      "Feel free to ask about teachings, history, or any aspect of faith you're curious about.";
  }
  return {
    role: 'assistant',
    content: response,
  };
};

const doctorResponseTemplate = (lastUserMessageContent: string) => {
  let doctorResponse = 'Baymax here, your virtual health advisor. ';
  if (lastUserMessageContent.toLowerCase().includes('health advice')) {
    doctorResponse +=
      "While I can provide general health tips, it's always best to consult with a real doctor for personal advice.";
  } else {
    doctorResponse +=
      'Feel free to ask general health questions or for wellness tips!';
  }
  return {
    role: 'assistant',
    content: doctorResponse,
  };
};

// Define a more flexible message interface
export interface EnhancedMessageInterface {
  role: 'user' | 'assistant' | 'system' | undefined;
  content: string | undefined;
}

// Utility function to ensure a message conforms to EnhancedMessageInterface
function ensureMessage(message: any): EnhancedMessageInterface {
  if (typeof message === 'undefined') {
    return { role: undefined, content: undefined }; // or some other default
  }
  return {
    role: typeof message.role === 'string' ? message.role : undefined,
    content: typeof message.content === 'string' ? message.content : undefined,
  };
}

function ensureMessage_relate(message: any): EnhancedMessageInterface {
  return {
    role: typeof message.role === 'string' ? message.role : undefined,
    content:
      typeof message.section_text === 'string'
        ? message.section_text
        : undefined,
  };
}

export const getChatCompletionStream = async (
  endpoint: string,
  messages: MessageInterface[],
  relatedTexts: Messagenew[],
  similarHistory: Messagenew1[],
  currentChatIndex: number,
  config: ConfigInterface,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  if (isAzureEndpoint(endpoint) && apiKey) {
    headers['api-key'] = apiKey;

    const model =
      config.model === 'gpt-3.5-turbo'
        ? 'gpt-35-turbo'
        : config.model === 'gpt-3.5-turbo-16k'
        ? 'gpt-35-turbo-16k'
        : config.model;

    const apiVersion = '2023-03-15-preview';

    const path = `openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;

    if (!endpoint.endsWith(path)) {
      if (!endpoint.endsWith('/')) {
        endpoint += '/';
      }
      endpoint += path;
    }
  }
  // Convert relatedTexts using ensureMessage_relate and the correct property name
  const formattedRelatedTexts = relatedTexts.map((textObject) =>
    ensureMessage_relate({
      role: 'system', // This is the role you're assigning
      section_text: textObject.content, // Use the correct property name from relatedTexts
    })
  );

  const formattedsimilarHistory = similarHistory.map((textObject) =>
    ensureMessage({
      role: 'system', // Keep as is, if that's your desired role
      content: textObject.content, // Changed from textObject.text to textObject.content
    })
  );

  // Reverse the messages array to access the latest messages first
  const messagesCopy = [...messages].reverse();
  // Extract the last user message
  const lastUserMessage = messagesCopy.find((msg) => msg.role === 'user');

  // Convert messagesCopy using ensureMessage
  const enhancedMessagesCopy = messagesCopy.map((msg) => ensureMessage(msg));

  // Ensure the last user message is also using ensureMessage
  const enhancedLastUserMessage = ensureMessage(lastUserMessage);

  // Now construct the new_messages array with ensured messages
  let new_messages: EnhancedMessageInterface[] = [];
  if (currentChatIndex === 0) {
    const bot = new GirlFriendBot();
    const initialMessages = bot.sendInitialMessagesIfNeeded();
    const girlfriendAIResponse = ensureMessage(
      bot.girlfriendResponse(enhancedLastUserMessage.content || '')
    );

    // Construct the new_messages array
    new_messages = [
      // girlfriendSystemPrompt,
      // girlfriendIntro,
      ...initialMessages,
      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy
        .filter((e) => {
          e.role !== 'system';
        })
        .slice(0, 4)
        .reverse(),

      girlfriendAIResponse,
      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,
    ];
  } else if (currentChatIndex === 1) {
    const bot = new BoyFriendBot();
    const initialMessages = bot.sendInitialMessagesIfNeeded();
    const boyfriendAIResponse = ensureMessage(
      bot.boyfriendResponse(enhancedLastUserMessage.content || '')
    );
    new_messages = [
      ...initialMessages,
      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy
        .filter((e) => {
          e.role !== 'system';
        })
        .slice(0, 4)
        .reverse(),

      boyfriendAIResponse,
      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,
    ];
  } else if (currentChatIndex === 2) {
    const friendIntro = ensureMessage({
      role: 'assistant',
      content:
        "What's up! 😄 I'm Jordan, your virtual friend. Looking for a chat, some advice, or just to hang out? I'm here for you!",
    });

    new_messages = [
      friendIntro, // Mentor's introduction

      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy.slice(0, 4).reverse(),

      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,

      ensureMessage(friendResponse(lastUserMessage?.content || '')), // Mentor's response
    ];
  } else if (currentChatIndex === 3) {
    const mentorIntro = ensureMessage({
      role: 'assistant',
      content:
        "Greetings! I'm John, ready to mentor you. Let's explore your goals and challenges together. How can I assist you today?",
    });

    new_messages = [
      mentorIntro, // Mentor's introduction

      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy.slice(0, 4).reverse(),

      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,

      ensureMessage(mentorResponse(lastUserMessage?.content || '')), // Mentor's response
    ];
  } else if (currentChatIndex === 4) {
    const teacherIntro = ensureMessage({
      role: 'assistant',
      content:
        "Greetings! 😊 I'm Kai, your virtual teacher. Ready to learn and discover? Let's embark on this educational journey together!",
    });

    new_messages = [
      teacherIntro, // Mentor's introduction

      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy.slice(0, 4).reverse(),

      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,

      ensureMessage(teacherResponse(lastUserMessage?.content || '')), // Mentor's response
    ];
  } else if (currentChatIndex === 5) {
    const christianIntro = ensureMessage({
      role: 'assistant',
      content:
        "Greetings! 😊 I'm ChristianGPT, ready to walk with you on this journey of faith. Need someone to share a prayer with or explore the Scriptures? I'm here for you.",
    });

    new_messages = [
      christianIntro, // Mentor's introduction

      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy.slice(0, 4).reverse(),

      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedRelatedTexts,
      ...formattedsimilarHistory,

      // Add the last user message
      enhancedLastUserMessage,

      ensureMessage(christianResponse(lastUserMessage?.content || '')), // Mentor's response
    ];
  } else if (currentChatIndex === 6) {
    const bot = new DoctorBot();
    const initialMessages = bot.sendInitialMessagesIfNeeded();
    const doctorAIResponse = ensureMessage(
      bot.doctorResponse(enhancedLastUserMessage.content || '')
    );

    // Construct the new_messages array
    new_messages = [
      // doctorSystemPrompt,
      // doctorIntro,
      ...initialMessages,
      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy
        .filter((e) => {
          e.role !== 'system';
        })
        .slice(0, 4)
        .reverse(),

      doctorAIResponse,
      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,
    ];
  }else {
    const mormonIntro = ensureMessage({
      role: 'assistant',
      content:
        "Greetings! I'm here to provide insights and discuss teachings from a Mormon perspective. How may I assist you with your spiritual journey or questions today?",
    });

    // Construct the new_messages array
    new_messages = [
      mormonIntro, // Mormon introduction

      // Include a slice of the conversation history (e.g., the last 4 messages)
      ...enhancedMessagesCopy.slice(0, 4).reverse(),

      // Flatten formattedRelatedTexts and ensure each is an object with 'role' and 'content'
      ...formattedsimilarHistory,
      ...formattedRelatedTexts,

      // Add the last user message
      enhancedLastUserMessage,

      // Use MormonResponseTemplate for the AI's response
      ensureMessage(mormonResponseTemplate(lastUserMessage?.content || '')),
    ];
  }
  console.log(new_messages);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: new_messages, // Replaced 'messages' with 'new_messages',
      ...config,
      max_tokens: undefined,
      stream: true,
    }),
  });
  if (response.status === 404 || response.status === 405) {
    const text = await response.text();
    if (text.includes('model_not_found')) {
      throw new Error(
        text +
          '\nMessage from Better ChatGPT:\nPlease ensure that you have access to the GPT-4 API!'
      );
    } else {
      throw new Error(
        'Message from Better ChatGPT:\nInvalid API endpoint! We recommend you to check your free API endpoint.'
      );
    }
  }

  if (response.status === 429 || !response.ok) {
    const text = await response.text();
    let error = text;
    if (text.includes('insufficient_quota')) {
      error +=
        '\nMessage from Better ChatGPT:\nWe recommend changing your API endpoint or API key';
    } else if (response.status === 429) {
      error += '\nRate limited!';
    }
    throw new Error(error);
  }

  const stream = response.body;
  return stream;
};

export const submitShareGPT = async (body: ShareGPTSubmitBodyInterface) => {
  const request = await fetch('https://sharegpt.com/api/conversations', {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const response = await request.json();
  const { id } = response;
  const url = `https://shareg.pt/${id}`;
  window.open(url, '_blank');
};

// Define types for the query response
type QueryResponse = {
  section_text: string;
  similarity: number;
}[];

// Function to query religious texts based on embeddings
export const queryReligiousTexts = async (
  query: string,
  search_doc: string
): Promise<QueryResponse> => {
  try {
    // Convert the query text to an embedding
    const embedding = await convertTextToOpenAIEmbedding(query);

    // Perform the vector similarity search in Supabase
    const { data, error } = await supabase
      .rpc(search_doc, { query_vector: embedding })
      .select('section_text, similarity');

    if (error) {
      throw new Error(`Error querying religious texts: ${error.message}`);
    }

    // Process and return the data
    return (data as QueryResponse).map(({ section_text, similarity }) => ({
      section_text: section_text, // Adjusted to match QueryResponse
      similarity: similarity, // Adjusted to match QueryResponse
    }));
  } catch (error: any) {
    console.error('Error querying girlfriend texts:', error.message);
    throw error;
  }
};

export async function storeMessageWithEmbedding(
  userId: string,
  session_newid: string,
  convers_id: string,
  role: string,
  content: string
): Promise<void> {
  // Convert text to embedding
  const embedding = await convertTextToOpenAIEmbedding(content);

  const { data, error } = await supabase.from(convers_id).insert([
    {
      user_id: userId,
      session_id: session_newid,
      role: role,
      content: content,
      embedding: embedding,
    },
  ]);

  if (error) {
    console.error('Error storing message with embedding:', error);
  } else {
    console.log('Message with embedding stored successfully:', data);
  }
}

export async function retrieveSimilarHistory(
  userId: string,
  session_newid: string,
  search_convers: string,
  query: string
): Promise<any[]> {
  const embedding = await convertTextToOpenAIEmbedding(query);

  const { data, error } = await supabase
    .rpc(search_convers, {
      p_user_id: userId, // Match the prefixed variable name
      p_query_session_id: session_newid, // Match the prefixed variable name
      p_query_vector: embedding, // Match the prefixed variable name
    })
    .select('content, similarity');

  if (error) {
    console.error('Error retrieving similar history:', error);
    return [];
  } else {
    return data;
  }
}
