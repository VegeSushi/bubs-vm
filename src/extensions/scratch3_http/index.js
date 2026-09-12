const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const fetch = require('node-fetch'); // Uses node-fetch as requested

class Scratch3Http {
    constructor(runtime) {
        this.runtime = runtime;
        this._lastStatusCode = null;
        
        // Store custom headers for outgoing requests
        this._requestHeaders = {};
        
        // Store headers from the most recent response
        this._lastResponseHeaders = {};
    }

    getInfo() {
        return {
            id: 'http',
            name: 'HTTP',
            color1: '#FF4C4C',
            color2: '#CC3C3C',
            color3: '#992C2C',
            blocks: [
                {
                    opcode: 'fetchUrl',
                    blockType: BlockType.REPORTER,
                    text: 'get HTTP content from [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://api.chucknorris.io/jokes/random"
                        }
                    }
                },
                {
                    opcode: 'sendAdvancedRequest',
                    blockType: BlockType.REPORTER,
                    text: 'send [METHOD] to [URL] with body [BODY]',
                    arguments: {
                        METHOD: {
                            type: ArgumentType.STRING,
                            menu: 'methods',
                            defaultValue: 'POST'
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://httpbin.org/post"
                        },
                        BODY: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"key":"value"}'
                        }
                    }
                },
                {
                    opcode: 'setRequestHeader',
                    blockType: BlockType.COMMAND,
                    text: 'set request header [NAME] to [VALUE]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "Content-Type"
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "application/json"
                        }
                    }
                },
                {
                    opcode: 'clearRequestHeaders',
                    blockType: BlockType.COMMAND,
                    text: 'clear all request headers'
                },
                {
                    opcode: 'getLastStatusCode',
                    blockType: BlockType.REPORTER,
                    text: 'last HTTP status code'
                },
                {
                    opcode: 'getResponseHeader',
                    blockType: BlockType.REPORTER,
                    text: 'get response header [NAME]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "content-type"
                        }
                    }
                }
            ],
            menus: {
                methods: {
                    acceptReporters: true,
                    items: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
                }
            }
        };
    }

    /**
     * Reporter: Simple GET request
     */
    async fetchUrl(args) {
        // Reuse the advanced request logic but force GET and empty body
        return this.sendAdvancedRequest({
            METHOD: 'GET',
            URL: args.URL,
            BODY: ''
        });
    }

    /**
     * Reporter: Advanced request with methods and payloads
     */
    async sendAdvancedRequest(args) {
        const method = Cast.toString(args.METHOD).toUpperCase();
        const url = Cast.toString(args.URL);
        const body = Cast.toString(args.BODY);

        const options = {
            method: method,
            headers: this._requestHeaders
        };

        // GET and HEAD requests cannot have a body
        if (method !== 'GET' && method !== 'HEAD' && body.trim() !== '') {
            options.body = body;
        }

        try {
            const response = await fetch(url, options);
            
            // Save status code
            this._lastStatusCode = response.status;
            
            // Save response headers (convert keys to lowercase for easier lookup later)
            this._lastResponseHeaders = {};
            for (const [key, value] of response.headers.entries()) {
                this._lastResponseHeaders[key.toLowerCase()] = value;
            }

            const text = await response.text();
            return text;

        } catch (e) {
            this._lastStatusCode = 0; // 0 usually implies network failure/CORS issue
            return `Network Error: ${e.message}`;
        }
    }

    /**
     * Command: Adds or updates a header for the NEXT outgoing request
     */
    setRequestHeader(args) {
        const name = Cast.toString(args.NAME);
        const value = Cast.toString(args.VALUE);
        if (name) {
            this._requestHeaders[name] = value;
        }
    }

    /**
     * Command: Clears all saved headers
     */
    clearRequestHeaders() {
        this._requestHeaders = {};
    }

    /**
     * Reporter: Returns the HTTP status code of the last request (e.g. 200, 404)
     */
    getLastStatusCode() {
        return this._lastStatusCode !== null ? this._lastStatusCode : '';
    }

    /**
     * Reporter: Gets a specific header from the LAST completed response
     */
    getResponseHeader(args) {
        const name = Cast.toString(args.NAME).toLowerCase();
        if (this._lastResponseHeaders.hasOwnProperty(name)) {
            return this._lastResponseHeaders[name];
        }
        return '';
    }
}

module.exports = Scratch3Http;
