const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Clipboard {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'clipboard',
            name: 'Clipboard',
            color1: '#7B68EE', // Main block color (Medium Slate Blue)
            color2: '#6A5ACD', // Border/Hover color (Slightly darker)
            color3: '#483D8B', // Shadow/Click color (Dark Slate Blue)
            blocks: [
                {
                    opcode: 'setClipboardText',
                    blockType: BlockType.COMMAND,
                    text: 'copy [TEXT] to clipboard',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello from Scratch!'
                        }
                    }
                }
            ]
        };
    }

    /**
     * Command block - sets the text of the system clipboard
     */
    setClipboardText(args) {
        const text = Cast.toString(args.TEXT);
        
        // Attempt 1: Use the modern clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(err => {
                console.warn('Modern clipboard write failed, trying fallback: ', err);
                this._fallbackCopy(text);
            });
        } else {
            // Attempt 2: Fallback for older browsers or restricted contexts
            this._fallbackCopy(text);
        }
    }

    /**
     * Fallback method using a temporary invisible text area.
     * This works on older browsers that don't support navigator.clipboard.
     */
    _fallbackCopy(text) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            
            // Prevent the browser from scrolling to the bottom of the page
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Execute the legacy copy command
            document.execCommand('copy');
            document.body.removeChild(textArea);
        } catch (err) {
            console.warn('Fallback clipboard copy failed: ', err);
        }
    }
}

module.exports = Scratch3Clipboard;
