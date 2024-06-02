import { MessageSeenSvg } from "@/lib/svgs";
import { IMessage, useConversationStore } from "@/store/chat-store";
import ChatBubbleAvatar from "./chat-bubble-avatar";
import DateIndicator from "./date-indicator";
import Image from "next/image";
import { useState } from "react";
// import { Dialog, DialogContent, DialogDescription } from "@radix-ui/react-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
} from "@/components/ui/dialog"
import ReactPlayer from "react-player";
import ChatAvatarActions from "./chat-avatar-actions";
import { Id } from "../../../convex/_generated/dataModel";
import { ListCollapse, Option } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";


type ChatBubbleProps = {
	me: {
		_id: Id<"users">;
		_creationTime: number;
		name?: string | undefined;
		image: string;
		email: string;
		tokenIdentifier: string;
		isOnline: boolean;
	},
	message: IMessage,
	previousMessage: IMessage | undefined
}

const ChatBubble = ({ me, message, previousMessage }: ChatBubbleProps) => {
	const date = new Date(message._creationTime)
	const hours = date.getHours().toString().padStart(2, "0")
	const minutes = date.getMinutes().toString().padStart(2, "0")
	const time = `${hours}:${minutes}`

	const [option, setOption] = useState<boolean>(false)

	const { selectedConversation } = useConversationStore()
	const isMember = selectedConversation?.participants.includes(message.sender._id) || false;
	const isGroup = selectedConversation?.isGroup;
	const fromMe = message.sender._id === me._id;
	const bgClass = fromMe ? "bg-green-chat" : "bg-white dark:bg-gray-primary"

	const deleteMessage = useMutation(api.messages.deleteMessage)

	const [open, setOpen] = useState<boolean>(false);


	const handleDelete = async () => {
		
		// @ts-expect-error
		await deleteMessage({ messageId: message._id, messageType: message.messageType, storageId: message?.storageId})
		console.log("Deleted YAYY")
	}

	if (!fromMe) {
		return (
			<div className="flex flex-col">
				<DateIndicator message={message} previousMessage={previousMessage} />
				<div className=" flex items-start gap-x-3">
					<div className="flex gap-3 w-fit">
						<ChatBubbleAvatar
							message={message}
							isMember={isMember}
							isGroup={isGroup}
						/>
						<div className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}>
							<OtherMessageIndicator />
							{isGroup && <ChatAvatarActions message={message} me={me} />}
							{message.messageType === "text" && <TextMessage message={message} />}
							{message.messageType === "image" && <ImageMessage message={message}
								handleClick={() => setOpen(true)}
							/>}
							{open && <ImageDialog
								src={message.content}
								open={open}
								onClose={() => setOpen(false)}
							/>}
							{message.messageType === "video" && <VideoMessage message={message} />}
							<MessageTime time={time} fromMe={fromMe} />
						</div>
					</div>
					<div className="relative">
						<ListCollapse className="text-slate-600 opacity-0 hover:opacity-80 duration-200 cursor-pointer dark:text-white"
							onClick={() => setOption(!option)} />
						<div className={`w-[100px] h-[cal(100px/3)] z-50 duration-75 ease-in rounded-lg -right-[110px] -top-[20px] flex flex-col bg-slate-300 dark:bg-slate-500 absolute ${option ? 'visible' : 'hidden'} `}>
							<p className="w-full rounded-tl-lg rounded-tr-lg cursor-pointer hover:bg-slate-600 h-1/3 flex items-center justify-center border-b-2 border-b-slate-200">Copy</p>
							<p className="w-full rounded-bl-lg rounded-br-lg cursor-pointer hover:bg-slate-600 h-1/3 flex items-center justify-center ">Forward</p>
						</div>
					</div>
				</div>
			</div>
		)
	}
	return (
		<div className="flex flex-col">
			<DateIndicator message={message} previousMessage={previousMessage} />
			<div className="flex self-end max-w-[70%] justify-end gap-x-3 relative ">
				<div className="relative">
					<ListCollapse className="text-slate-600 opacity-0 hover:opacity-80 duration-200 cursor-pointer dark:text-white"
						onClick={() => setOption(!option)} />
					<div className={`w-[100px] z-50 h-[100px] rounded-lg -left-[100px] -top-[50px] flex flex-col bg-slate-300 dark:bg-slate-500 absolute ${option ? 'visible' : 'hidden'} `}>
						<p className="w-full h-1/3 flex items-center justify-center rounded-tl-lg rounded-tr-lg cursor-pointer hover:bg-slate-600 border-b-2 border-b-slate-200">Copy</p>
						<p className="w-full h-1/3 flex items-center justify-center cursor-pointer hover:bg-slate-600 border-b-2 border-b-slate-200">Forward</p>
						<p className="w-full h-1/3 flex items-center justify-center rounded-bl-lg rounded-br-lg cursor-pointer hover:bg-slate-600" onClick={handleDelete}>Delete</p>
					</div>
				</div>
				<div className="flex gap-3 w-fit ">
					<div className={`flex flex-col z-20 ml-auto max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}>
						<SelfMessageIndicator />
						{message.messageType === "text" && <TextMessage message={message} />}
						{message.messageType === "image" && <ImageMessage message={message}
							handleClick={() => setOpen(true)}
						/>}
						{open && <ImageDialog
							src={message.content}
							open={open}
							onClose={() => setOpen(false)}
						/>}
						{message.messageType === "video" && <VideoMessage message={message} />}
						<MessageTime time={time} fromMe={fromMe} />
					</div>
				</div>
			</div>
		</div>
	)
};
export default ChatBubble;

const OtherMessageIndicator = () => (
	<div className='absolute bg-white dark:bg-gray-primary top-0 -left-[4px] w-3 h-3 rounded-bl-full' />
);

const SelfMessageIndicator = () => (
	<div className='absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden' />
);

const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => {
	return (
		<p className='text-[10px] mt-2 self-end flex gap-1 items-center'>
			{time} {fromMe && <MessageSeenSvg />}
		</p>
	);
};

const ImageDialog = ({ src, onClose, open }: { open: boolean; src: string; onClose: () => void }) => {
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<DialogContent className='min-w-[750px]'>
				<DialogDescription className='relative h-[450px] flex justify-center'>
					<Image src={src} fill className='rounded-lg object-contain' alt='image' />
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
};

const TextMessage = ({ message }: { message: IMessage }) => {
	const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

	return (
		<div>
			{isLink ? (
				<a
					href={message.content}
					target='_blank'
					rel='noopener noreferrer'
					className={`mr-2 text-sm font-light text-blue-400 underline`}
				>
					{message.content}
				</a>
			) : (
				<p className={`mr-2 text-sm font-light`}>{message.content}</p>
			)}
		</div>
	);
};

const ImageMessage = ({ message, handleClick }: { message: IMessage; handleClick: () => void }) => {
	return (
		<div className='w-[250px] h-[250px] m-2 relative'>
			<Image
				src={message.content}
				fill
				className='cursor-pointer object-cover rounded'
				alt='image'
				onClick={handleClick}
			/>
		</div>
	);
};

const VideoMessage = ({ message }: { message: IMessage }) => {
	return <ReactPlayer url={message.content} width='250px' height='250px' controls={true} light={true} />;
};