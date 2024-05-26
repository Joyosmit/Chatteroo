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

	const { selectedConversation } = useConversationStore()
	const isMember = selectedConversation?.participants.includes(message.sender._id) || false;
	const isGroup = selectedConversation?.isGroup;
	const fromMe = message.sender._id === me._id;
	const bgClass = fromMe ? "bg-green-chat" : "bg-white dark:bg-gray-primary"

	const [open, setOpen] = useState<boolean>(false);

	if (!fromMe) {
		return (
			<>
				<DateIndicator message={message} previousMessage={previousMessage} />
				<div className="flex gap-3 w-2/3">
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
			</>
		)
	}
	return (
		<>
			<DateIndicator message={message} previousMessage={previousMessage} />
			<div className="flex gap-3 w-2/3 ml-auto">
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
		</>
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