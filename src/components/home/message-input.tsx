import { ImageIcon, Laugh, Mic, Plus, Send, VideoIcon, X } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import toast from "react-hot-toast";
import useComponentVisible from "@/hooks/useComponentVisible";
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import MediaDropdown from "./media-dropdown";
import useReplyStore from "@/store/reply-store";

const MessageInput = () => {
	const [msgText, setMsgText] = useState("");
	const sendTextMsg = useMutation(api.messages.sendTextMessage)
	const me = useQuery(api.users.getMe)
	const { selectedConversation } = useConversationStore();
	const { replies, addReply } = useReplyStore()
	const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
	const handleSendTextMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			if (!msgText.trim()) return;
			if (replies.messageId) {
				await sendTextMsg({
					content: msgText,
					sender: me!._id,
					conversation: selectedConversation!._id,
					replyMessageId: replies.messageId
				})
			}
			else {
				await sendTextMsg({
					content: msgText,
					sender: me!._id,
					conversation: selectedConversation!._id,
				})
			}

			setMsgText("")
		} catch (error: any) {
			toast.error(error.message)
			console.error(error)
		} finally {
			addReply("", null, "", "", "")
		}
	}


	const handleCancelReply = () => {
		addReply("", null, "", "", "")
	}
	return (
		<>
			<div className={`w-full h-20 relative dark:bg-custom-gradient mt-5 flex duration-300 ${replies.conversationId != '' ? 'visible' : 'hidden'}`}>
				<div className="bg-green-800 w-4/5 rounded-lg border-4 border-slate-700 mx-auto h-[80%] my-auto p-2 flex flex-col">
					<p className=" dark:text-slate-300 text-black">{replies.senderName}</p>
					{replies.messageType === 'text' ? <p className="dark:text-white text-slate-600 font-semibold">{replies.messageContent}</p> : null}
					{replies.messageType === 'image' ? <ImageIcon size={16} className="text-white"/> : null}
					{replies.messageType === 'video' ? <VideoIcon size={16} className="text-white"/> : null}
				</div>
				<X size={32} className="text-white absolute right-[5%] top-[28%] cursor-pointer"
					onClick={handleCancelReply} />
			</div>
			<div className='bg-gray-primary p-2 flex gap-4 items-center'>
				<div className='relative flex gap-2 ml-2'>
					{/* EMOJI PICKER WILL GO HERE */}
					<div className=" lg:flex" ref={ref} onClick={() => setIsComponentVisible(true)}>
						{isComponentVisible &&
							<EmojiPicker
								theme={Theme.DARK}
								emojiStyle={EmojiStyle.GOOGLE}
								onEmojiClick={(emojiObject) => {
									setMsgText(prev => prev + emojiObject.emoji)
								}}
								style={{ position: "absolute", bottom: "1.5rem", left: "1rem", zIndex: 50 }}
							/>}
						<Laugh className='text-gray-600 dark:text-gray-400' />
					</div>
					<MediaDropdown />
				</div>
				<form onSubmit={handleSendTextMessage} className='w-full flex gap-3'>
					<div className='flex-1'>
						<Input
							type='text'
							placeholder='Type a message'
							className='py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent'
							value={msgText}
							onChange={(e) => setMsgText(e.target.value)}
						/>
					</div>
					<div className='mr-4 flex items-center gap-3'>
						{msgText.length > 0 ? (
							<Button
								type='submit'
								size="sm"
								className='bg-transparent text-foreground hover:bg-transparent'
							>
								<Send />
							</Button>
						) : (
							<Button
								type='submit'
								size="sm"
								className='bg-transparent text-foreground hover:bg-transparent'
							>
								<Mic />
							</Button>
						)}
					</div>
				</form>
			</div>
		</>
	);
};
export default MessageInput;

