import { useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ImageIcon, Plus, Video } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import ReactPlayer from "react-player";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
} from "@/components/ui/dialog"
import useReplyStore from "@/store/reply-store";

const maxSize = 500 * 1024; // 500 KB
const MediaDropdown = () => {
    const imageInput = useRef<HTMLInputElement>(null);
    const videoInput = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const me = useQuery(api.users.getMe)
    const generateUploadUrl = useMutation(api.conversations.generateUploadUrl)
    const sendImage = useMutation(api.messages.sendImage)
    const sendVideo = useMutation(api.messages.sendVideo)

    const { selectedConversation } = useConversationStore()
    const { replies, addReply } = useReplyStore()
    const handleSendImage = async () => {
        setIsLoading(true);
        // send image
        try {
            if (selectedImage?.size! > maxSize) {
                throw new Error("Large")
            }
            const postUrl = await generateUploadUrl();
            const res = await fetch(postUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': selectedImage?.type!
                },
                body: selectedImage
            })
            const { storageId } = await res.json();
            if (!replies.messageId) {
                await sendImage({
                    sender: me!._id,
                    conversation: selectedConversation?._id!,
                    imgId: storageId
                })
            } else {
                await sendImage({
                    sender: me!._id,
                    conversation: selectedConversation?._id!,
                    imgId: storageId,
                    replyMessageId: replies.messageId
                })
            }
        } catch (error: any) {
            // toast.error("Failed to send image")
            if (error.message === "Large") {
                toast.error("Image size should be less than 500 KB")
            } else {
                toast.error("Failed to send image")
            }
        } finally {
            setSelectedImage(null);
            setIsLoading(false);
            addReply("", null, "", "", "")
        }
    }

    const handleSendVideo = async () => {
        if (selectedVideo && selectedVideo.size > 2 * 1024 * 1024) { // Check if the video size is greater than 2MB
            toast.error(" Video size exceeds 2MB.");
            return;
            // throw new Error("Large")
        }
        setIsLoading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedVideo!.type },
                body: selectedVideo,
            });

            const { storageId } = await result.json();
            if (!replies.messageId) {
                await sendVideo({
                    videoId: storageId,
                    conversation: selectedConversation!._id,
                    sender: me!._id,
                });
            } else {
                await sendVideo({
                    videoId: storageId,
                    conversation: selectedConversation!._id,
                    sender: me!._id,
                    replyMessageId: replies.messageId,
                });
            }

            setSelectedVideo(null);
        } catch (error: any) {
            if (error.message == "Large") {
                toast.error("Video size should be less than 2 MB")
            } else {
                toast.error("Failed to send video")
            }
        } finally {
            setIsLoading(false);
            addReply("", null, "", "", "")
        }
    };
    return (
        <>
            <input
                type='file'
                ref={imageInput}
                accept='image/*'
                onChange={(e) => setSelectedImage(e.target.files![0])}
                hidden
            />

            <input
                type='file'
                ref={videoInput}
                accept='video/mp4'
                onChange={(e) => setSelectedVideo(e.target?.files![0])}
                hidden
            />

            {selectedImage && (
                <MediaImageDialog
                    isOpen={selectedImage !== null}
                    onClose={() => setSelectedImage(null)}
                    selectedImage={selectedImage}
                    isLoading={isLoading}
                    handleSendImage={handleSendImage}
                />
            )}

            {selectedVideo && (
                <MediaVideoDialog
                    isOpen={selectedVideo !== null}
                    onClose={() => setSelectedVideo(null)}
                    selectedVideo={selectedVideo}
                    isLoading={isLoading}
                    handleSendVideo={handleSendVideo}
                />
            )}
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Plus className='text-gray-600 dark:text-gray-400' />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => imageInput.current!.click()}>
                        <ImageIcon size={18} className='mr-1' /> Photo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => videoInput.current!.click()}>
                        <Video size={20} className='mr-1' />
                        Video
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default MediaDropdown

type MediaImageDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedImage: File;
    isLoading: boolean;
    handleSendImage: () => void;
};

const MediaImageDialog = ({ isOpen, onClose, selectedImage, isLoading, handleSendImage }: MediaImageDialogProps) => {
    const [renderedImage, setRenderedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedImage) return;
        const reader = new FileReader();
        reader.onload = (e) => setRenderedImage(e.target?.result as string);
        reader.readAsDataURL(selectedImage);
    }, [selectedImage]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent>
                <DialogDescription className='flex flex-col gap-10 justify-center items-center'>
                    {renderedImage && <Image src={renderedImage} width={300} height={300} alt='selected image' />}
                    <Button className='w-full' disabled={isLoading} onClick={handleSendImage}>
                        {isLoading ? "Sending..." : "Send"}
                    </Button>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

type MediaVideoDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedVideo: File;
    isLoading: boolean;
    handleSendVideo: () => void;
};

const MediaVideoDialog = ({ isOpen, onClose, selectedVideo, isLoading, handleSendVideo }: MediaVideoDialogProps) => {
    const renderedVideo = URL.createObjectURL(new Blob([selectedVideo], { type: "video/mp4" }));

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent>
                <DialogDescription>Video</DialogDescription>
                <div className='w-full'>
                    {renderedVideo && <ReactPlayer url={renderedVideo} controls width='100%' />}
                </div>
                <Button className='w-full' disabled={isLoading} onClick={handleSendVideo}>
                    {isLoading ? "Sending..." : "Send"}
                </Button>
            </DialogContent>
        </Dialog>
    );
};