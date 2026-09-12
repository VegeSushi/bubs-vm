const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3WebSocket {
    constructor(runtime) {
        this.runtime = runtime;
        this.ws = null;
        this.lastMessage = '';
        this.connectionState = 'disconnected'; 
        this.lastError = '';
        
        // This is our secret weapon to prevent Hat spamming
        this._isHandlingMessage = false; 
    }

    getInfo() {
        return {
            id: 'websocket',
            name: 'WebSocket',
            color1: '#00C7B5', 
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
                    blockType: BlockType.HAT,
                    text: 'when message received',
                    isEdgeActivated: false
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
     * Hat Block logic:
     * Scratch will poll this 30 times a second. It will only return true 
     * during the exact fraction of a millisecond that a message is being processed!
     */
    whenMessageReceived() {
        return this._isHandlingMessage;
    }

    connectToServer(args) {
        const url = Cast.toString(args.URL);

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
                
                // 1. Turn the flag ON
                this._isHandlingMessage = true;
                
                // 2. Force Scratch to evaluate the Hat block (it will see "true" and fire!)
                this.runtime.startHats('websocket_whenMessageReceived');
                
                // 3. Immediately turn it OFF so it doesn't spam on the next frame
                this._isHandlingMessage = false;
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

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connectionState = 'disconnected';
        }
    }

    sendData(args) {
        const data = Cast.toString(args.DATA);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.warn('Cannot send data: WebSocket is not connected.');
        }
    }

    getLastMessage() {
        return this.lastMessage;
    }

    isConnected() {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    getConnectionState() {
        return this.connectionState;
    }
}

module.exports = Scratch3WebSocket;
