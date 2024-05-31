import { useConversationStore } from "@/store/chat-store";
import { useMobileStore } from "@/store/mobile-store";
import Image from "next/image";
import { useState } from "react";

const ShowLeft = ({ className }: { className: string }) => {
    const { selectedLeft, placeholderNeeded, setPlaceholderNeeded, setSelectedLeft } = useMobileStore()
    const { selectedConversation } = useConversationStore()
    const handleMenuClick = () => {
        setPlaceholderNeeded(false);
        // setSelectedLeft(!selectedLeft);
    };

    return (
        <nav className={`bg-[#17797C] p-10 top-0 left-0 lg:hidden z-20 h-10 w-[100vw] absolute ${(!selectedLeft || selectedConversation) || !placeholderNeeded ? 'hidden' : ''} ${className}`}>
            <div className="container mx-auto flex justify-between items-center">
                {/* <div className="text-white text-lg font-bold">MyNavbar</div>
                 */}
                <Image src="/Chatteroo.png" alt="Chatteroo" height={30} width={100}/>
                <div className="">
                    <button
                        onClick={handleMenuClick}
                        className="text-white"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        </svg>
                        {/* ABCD */}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default ShowLeft;
