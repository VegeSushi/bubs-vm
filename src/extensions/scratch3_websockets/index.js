const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3WebSocket {
    constructor(runtime) {
        this.runtime = runtime;
        this.ws = null;
        this.lastMessage = '';
        this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected'
        this.lastError = '';
    }

    getInfo() {
        return {
            id: 'websocket',
            name: 'WebSocket',
            color1: '#00C7B5', // Cyan/Teal
            color2: '#00A395',
            color3: '#007A6F',
            blocks: [
                {
                    opcode: 'connectToServer',
                    blockType: BlockType.COMMAND,
                    text: 'connect to WebSocket [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'wss://echo.websocket.org'
                        }
                    }
                },
                {
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: 'disconnect'
                },
                {
                    opcode: 'sendData',
                    blockType: BlockType.COMMAND,
                    text: 'send [DATA] over WebSocket',
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Server!'
                        }
                    }
                },
                {
                    opcode: 'whenMessageReceived',
                    // CHANGED TO EVENT: This stops Scratch from constantly polling it.
                    blockType: BlockType.EVENT, 
                    text: 'when message received'
                },
                {
                    opcode: 'getLastMessage',
                    blockType: BlockType.REPORTER,
                    text: 'last received message'
                },
                {
                    opcode: 'isConnected',
                    blockType: BlockType.BOOLEAN,
                    text: 'connected?'
                },
                {
                    opcode: 'getConnectionState',
                    blockType: BlockType.REPORTER,
                    text: 'connection state'
                }
            ]
        };
    }

    /**
     * Because this is an EVENT block, it is only called when we trigger it.
     * Returning true allows the script attached to the Hat block to run!
     */
    whenMessageReceived() {
        return true;
    }

    /**
     * Command: Connects to a WebSocket server
     */
    connectToServer(args) {
        const url = Cast.toString(args.URL);

        // Close existing connection if there is one
        if (this.ws) {
            this.ws.close();
        }

        this.connectionState = 'connecting';

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.connectionState = 'connected';
                this.lastError = '';
                console.log(`WebSocket connected to ${url}`);
            };

            this.ws.onmessage = (event) => {
                this.lastMessage = event.data;
                // Force Scratch to trigger the "when message received" EVENT block
                this.runtime.startHats('websocket_whenMessageReceived');
            };

            this.ws.onclose = () => {
                this.connectionState = 'disconnected';
                this.ws = null;
                console.log('WebSocket disconnected');
            };

            this.ws.onerror = (error) => {
                this.connectionState = 'disconnected';
                this.lastError = 'Connection Error';
                console.warn('WebSocket error: ', error);
            };

        } catch (e) {
            this.connectionState = 'disconnected';
            this.lastError = e.message;
            console.warn('WebSocket creation failed: ', e);
        }
    }

    /**
     * Command: Disconnects from the current server
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connectionState = 'disconnected';
        }
    }

    /**
     * Command: Sends a string message to the server
     */
    sendData(args) {
        const data = Cast.toString(args.DATA);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.warn('Cannot send data: WebSocket is not connected.');
        }
    }

    /**
     * Reporter: Gets the most recent message received
     */
    getLastMessage() {
        return this.lastMessage;
    }

    /**
     * Boolean: Returns true if the WebSocket is currently open and active
     */
    isConnected() {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Reporter: Returns 'connected', 'connecting', or 'disconnected'
     */
    getConnectionState() {
        return this.connectionState;
    }
}

module.exports = Scratch3WebSocket;
