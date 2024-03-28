// /src/hooks/useInitialiseNewChat.ts
import useStore from '@store/store';
import { generateDefaultChatWithTitle } from '@constants/chat'; // Adjust the path as necessary

const useInitialiseNewChat = () => {
  const { setChats, chatsInitialized, setChatsInitialized } = useStore(state => ({
    setChats: state.setChats,
    chatsInitialized: state.chatsInitialized,
    setChatsInitialized: state.setChatsInitialized,
  }));

  const initialiseNewChat = () => {
    if (!chatsInitialized) {
      const newChats = [        
        generateDefaultChatWithTitle("Girl Friend"),
        generateDefaultChatWithTitle("Boy Friend"),
        generateDefaultChatWithTitle("Friend"),
        generateDefaultChatWithTitle("Mentor"),
        generateDefaultChatWithTitle("Teacher"),
        generateDefaultChatWithTitle("ChristianGPT"),
        generateDefaultChatWithTitle("Doctor") 
      ];
  
      setChats(newChats);
      setChatsInitialized(true);
    }
  };

  return { initialiseNewChat };
};

export default useInitialiseNewChat;

