import { useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ImageIcon, Plus, Video } from "lucide-react";

const MediaDropdown = () => {
    const imageInput = useRef<HTMLInputElement>(null);
    const videoInput = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
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
