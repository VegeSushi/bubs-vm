const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Hash {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'hash',
            name: 'Hashing',
            color1: '#434343', // Dark Slate Grey
            color2: '#2F2F2F',
            color3: '#1A1A1A',
            blocks: [
                {
                    opcode: 'hashString',
                    blockType: BlockType.REPORTER,
                    text: 'hash [TEXT] using [ALGORITHM]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Scratch'
                        },
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'algorithms',
                            defaultValue: 'SHA-256'
                        }
                    }
                }
            ],
            menus: {
                algorithms: {
                    acceptReporters: true,
                    items: ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1']
                }
            }
        };
    }

    /**
     * Converts text to a cryptographic hash
     */
    async hashString(args) {
        const text = Cast.toString(args.TEXT);
        const algorithm = Cast.toString(args.ALGORITHM);

        if (!crypto || !crypto.subtle) {
            return 'Error: Web Crypto API not available';
        }

        try {
            // Encode string as UTF-8 bytes
            const msgUint8 = new TextEncoder().encode(text);
            
            // Hash the bytes asynchronously
            const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
            
            // Convert buffer to byte array
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            
            // Convert bytes to hex string
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
            
        } catch (e) {
            return `Error: ${e.message}`;
        }
    }
}

module.exports = Scratch3Hash;
