import { IMessage, useConversationStore } from "@/store/chat-store"
import { Ban, LogOut } from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type ChatAvatarActionsProps = {
    message: IMessage,
    me: {
        _id: Id<"users">;
        _creationTime: number;
        name?: string | undefined;
        image: string;
        email: string;
        tokenIdentifier: string;
        isOnline: boolean;
    }
}

const ChatAvatarActions = ({ message, me }: ChatAvatarActionsProps) => {
    const { selectedConversation, setSelectedConversation } = useConversationStore()

    const isMember = selectedConversation?.participants.includes(message.sender._id);

    const kickUser = useMutation(api.conversations.kickUser)
    const handleKickUser = async() => {
        if(!selectedConversation) return;
        try {
            await kickUser({conversationId: selectedConversation._id, userId: message.sender._id})
            setSelectedConversation({...selectedConversation, participants: selectedConversation.participants.filter((id) => id !== message.sender._id)})
        } catch (error:any) {
            console.log(error.message)
        }
    }
    return (
        <div className="text-[11px] flex gap-4 justify-between font-bold cursor-pointer">
            {message.sender.name}

            {isMember && selectedConversation?.admin === me._id && (
                <LogOut size={16} className="text-red-500 opacity-0 hover:opacity-100"
                onClick={handleKickUser}/>
            )}
            {!isMember && <Ban size={16} className="text-red-500"/>}
        </div>
    )
}

export default ChatAvatarActions
