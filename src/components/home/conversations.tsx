import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const Conversation = ({ conversation }: { conversation: any }) => {
	const conversationImage = conversation.groupImage || conversation.image;
	const conversationName = conversation.groupName || conversation.name;
	const lastMessage = conversation.lastMessage;
	const lastMessageType = lastMessage?.messageType;

	const me = useQuery(api.users.getMe);

	const { setSelectedConversation, selectedConversation } = useConversationStore()
	const activeBgClass = selectedConversation?._id === conversation._id;

	const previousLastMessage = useRef(lastMessage);
	

	useEffect(() => {
		if (previousLastMessage.current && lastMessage && previousLastMessage.current._creationTime !== lastMessage._creationTime && lastMessage.sender !== me?._id && !activeBgClass) {
		//   toast.success("You have a new message!");
		toast('You have a new message', {
			duration: 4000,
			position: 'top-center',
		  
			// Styling
			style: {},
			className: '',
		  
			// Custom Icon
			icon: '🔔',
		  
			// Change colors of success/error/loading icon
			iconTheme: {
			  primary: '#000',
			  secondary: '#fff',
			},
		  
			// Aria
			ariaProps: {
			  role: 'status',
			  'aria-live': 'polite',
			},
		  });
		  // Alternatively, you can use a more sophisticated notification system
		  // like toast notifications instead of a browser alert.
		}
		previousLastMessage.current = lastMessage;
	  }, [lastMessage]);

	return (
		<>
			<div className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer 
			${activeBgClass ? "bg-chat-hover" : ""}`}
			onClick={()=>setSelectedConversation(conversation)}>
				<Avatar className='border border-gray-900 overflow-visible relative'>
					{conversation.isOnline && (
						<div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
					)}
					<AvatarImage src={conversationImage || "/placeholder.png"} className='object-cover rounded-full' />
					<AvatarFallback>
						<div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
					</AvatarFallback>
				</Avatar>
				<div className='w-full'>
					<div className='flex items-center'>
						<h3 className='text-xs lg:text-sm font-medium'>{conversationName}</h3>
						<span className='text-[10px] lg:text-xs text-gray-500 ml-auto'>
							{formatDate(lastMessage?._creationTime || conversation._creationTime)}
						</span>
					</div>
					<p className='text-[12px] mt-1 text-gray-500 flex items-center gap-1 '>
						{lastMessage?.sender === me?._id ? <MessageSeenSvg /> : ""}
						{conversation.isGroup && <Users size={16} />}
						{!lastMessage && "Say Hi!"}
						{lastMessageType === "text" ? lastMessage?.content.length > 30 ? (
							<span className='text-xs'>{lastMessage?.content.slice(0, 30)}...</span>
						) : (
							<span className='text-xs'>{lastMessage?.content}</span>
						) : null}
						{lastMessageType === "image" && <ImageIcon size={16} />}
						{lastMessageType === "video" && <VideoIcon size={16} />}
					</p>
				</div>
			</div>
			<hr className='h-[1px] mx-10 bg-gray-primary' />
		</>
	);
};
export default Conversation;