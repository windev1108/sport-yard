import React from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { AiFillCloseCircle } from 'react-icons/ai'
import IconButton from '@mui/material/IconButton'



const EmojisPicker= ({ setEmoji, setShowEmoji }) => {

    return (
        <div className="absolute bottom-[100%] right-[-100%] z-[10002]">
            <IconButton
                onClick={() => setShowEmoji(false)}
                className="absolute -top-4 z-[1000] -right-4">
                <AiFillCloseCircle size={30} className=" text-primary" />
            </IconButton>
            <Picker preview={false} theme="light" autoFocus={true} data={data} onEmojiSelect={setEmoji} />
        </div>
    )
}

export default EmojisPicker