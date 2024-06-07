import { create } from 'zustand';
import { Id } from '../../convex/_generated/dataModel';

type MessageType = 'image' | 'text' | 'video' | ''

type ReplyStore = {
    // replies: Record<string, string[]>;
    replies: {
        conversationId: string;
        messageId: Id<'messages'> | null;
        messageType: MessageType
        messageContent: string;
        senderName: string;
    }
    messageId: any;
    setMessageId: (messageId: any) => void;
    addReply: (conversationId: any, messageId: any, messageType: MessageType, messageContent: string, senderName: string) => void;
};

const useReplyStore = create<ReplyStore>((set) => ({
    replies: {
        conversationId: "",
        messageId: null,
        messageType: "",
        messageContent: "",
        senderName: "",
    },
    addReply: (conversationId, messageId, messageType, messageContent, senderName) => {
        set(() => {
            return {
                replies: {
                    conversationId,
                    messageId,
                    messageContent,
                    messageType: messageType as MessageType, // Add type assertion here
                    senderName,
                }
            }
        })
    },
    messageId: null,
    setMessageId: (messageId) => set({ messageId }),
}));

export default useReplyStore;