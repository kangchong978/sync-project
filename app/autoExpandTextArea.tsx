import { useState } from "react";
import send_png from "./images/send.png";

interface AutoExpandTextareaProps {
    onSend: (message: string) => void;
}

function AutoExpandTextarea({ onSend }: AutoExpandTextareaProps) {
    const [text, setText] = useState("");

    const handleChange = (event: any) => {
        setText(event.target.value);
    };

    const calculateTextAreaHeight = (element: any) => {
        element.style.height = "auto";
        element.style.height = `${Math.min(element.scrollHeight, 200)}px`; // Set a maximum height of 200 pixels
    };

    const handleTextareaResize = (event: any) => {
        calculateTextAreaHeight(event.target);
    };

    const handleSend = () => {
        // Handle sending the text message
        console.log("Sending message:", text);
        onSend(text);

        // Reset the textarea value and height
        setText("");
        const textarea = document.getElementById("textarea");
        if (textarea) {
            textarea.style.height = "auto";
        }
    };

    return (
        <div className="relative">
            <textarea
                id="textarea"
                className="dark:bg-neutral-900 w-full block w-full rounded-md border-0 py-1.5 pl-3 pr-20 text-gray-500 dark:text-gray-300 ring-0 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-0 sm:text-sm sm:leading-6 max-h-200 resize-none "
                value={text}
                onChange={handleChange}
                onInput={handleTextareaResize}
                placeholder="Type something..."
            />
            <button
                className="absolute right-2 bottom-2 bg-blue-500 text-white px-3 py-2 rounded-full"
                onClick={handleSend}
            >
                <img src={send_png.src} className="h-6 inline mr-1" />
            </button>
        </div>
    );
}

export default AutoExpandTextarea;
