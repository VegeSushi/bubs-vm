const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Json {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'json',
            name: 'JSON',
            color1: '#FF9933',
            color2: '#CC7A29',
            color3: '#995C1F',
            blocks: [
                {
                    opcode: 'isValidJson',
                    blockType: BlockType.BOOLEAN,
                    text: 'is [JSON_STRING] valid JSON?',
                    arguments: {
                        JSON_STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"name":"Scratch"}'
                        }
                    }
                },
                {
                    opcode: 'getValueAtPath',
                    blockType: BlockType.REPORTER,
                    text: 'get value at path [PATH] from [JSON_STRING]',
                    arguments: {
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'users.0.name'
                        },
                        JSON_STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"users":[{"name":"Scratch"}]}'
                        }
                    }
                },
                {
                    opcode: 'setValueAtPath',
                    blockType: BlockType.REPORTER,
                    text: 'set path [PATH] to [VALUE] in [JSON_STRING]',
                    arguments: {
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'users.0.name'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Gobo'
                        },
                        JSON_STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"users":[{"name":"Scratch"}]}'
                        }
                    }
                },
                {
                    opcode: 'getArrayLength',
                    blockType: BlockType.REPORTER,
                    text: 'length of array at path [PATH] in [JSON_STRING]',
                    arguments: {
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'users'
                        },
                        JSON_STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"users":["Scratch", "Gobo", "Pico"]}'
                        }
                    }
                },
                {
                    opcode: 'getKeysAtPath',
                    blockType: BlockType.REPORTER,
                    text: 'get keys at path [PATH] from [JSON_STRING]',
                    arguments: {
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'user'
                        },
                        JSON_STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"user":{"name":"Scratch","age":15}}'
                        }
                    }
                }
            ]
        };
    }

    /**
     * Helper function to convert paths like "users[0].name" or "users.0.name" 
     * into an array of keys: ["users", "0", "name"]
     */
    _parsePath(pathString) {
        if (!pathString) return [];
        return pathString.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    }

    /**
     * Boolean block - checks if string can be parsed as JSON
     */
    isValidJson(args) {
        const jsonString = Cast.toString(args.JSON_STRING);
        try {
            JSON.parse(jsonString);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Reporter block - gets a value from a nested JSON structure
     */
    getValueAtPath(args) {
        const jsonString = Cast.toString(args.JSON_STRING);
        const pathString = Cast.toString(args.PATH);

        try {
            const data = JSON.parse(jsonString);
            const keys = this._parsePath(pathString);
            
            let current = data;
            for (const key of keys) {
                if (current === null || typeof current !== 'object') return '';
                current = current[key];
            }

            // If the result is an object or array, stringify it so Scratch can handle it
            if (typeof current === 'object' && current !== null) {
                return JSON.stringify(current);
            }

            return current === undefined ? '' : String(current);
        } catch (e) {
            return '';
        }
    }

    /**
     * Reporter block - Sets a value in the JSON and returns the NEW JSON string.
     * This allows Scratch users to chain changes together or save the result to a variable.
     */
    setValueAtPath(args) {
        const jsonString = Cast.toString(args.JSON_STRING);
        const pathString = Cast.toString(args.PATH);
        const valueString = Cast.toString(args.VALUE);

        let data;
        try {
            // Default to empty object if input is empty or invalid
            data = jsonString.trim() === '' ? {} : JSON.parse(jsonString);
        } catch (e) {
            data = {}; 
        }

        // Try to parse the injected value so we can insert real booleans, numbers, or sub-objects
        let parsedValue = valueString;
        if (valueString === 'true') parsedValue = true;
        else if (valueString === 'false') parsedValue = false;
        else if (valueString === 'null') parsedValue = null;
        else if (!isNaN(valueString) && valueString.trim() !== '') {
            parsedValue = Number(valueString);
        } else {
            try {
                parsedValue = JSON.parse(valueString);
            } catch (e) {
                // Keep as string if it doesn't parse
            }
        }

        const keys = this._parsePath(pathString);
        if (keys.length === 0) return JSON.stringify(parsedValue);

        let current = data;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined || typeof current[key] !== 'object') {
                // If the next key is a number, create an array, otherwise create an object
                current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = parsedValue;
        return JSON.stringify(data);
    }

    /**
     * Reporter block - gets the length of an array at a specific path
     */
    getArrayLength(args) {
        const jsonString = Cast.toString(args.JSON_STRING);
        const pathString = Cast.toString(args.PATH);

        try {
            let data = JSON.parse(jsonString);
            const keys = this._parsePath(pathString);
            
            let current = data;
            for (const key of keys) {
                if (current === null || typeof current !== 'object') return 0;
                current = current[key];
            }

            if (Array.isArray(current)) {
                return current.length;
            }
            return 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Reporter block - Returns an array of keys as a JSON array string
     * Useful for looping through an object's properties
     */
    getKeysAtPath(args) {
        const jsonString = Cast.toString(args.JSON_STRING);
        const pathString = Cast.toString(args.PATH);

        try {
            let data = JSON.parse(jsonString);
            const keys = this._parsePath(pathString);
            
            let current = data;
            for (const key of keys) {
                if (current === null || typeof current !== 'object') return '[]';
                current = current[key];
            }

            if (current !== null && typeof current === 'object' && !Array.isArray(current)) {
                return JSON.stringify(Object.keys(current));
            }
            return '[]';
        } catch (e) {
            return '[]';
        }
    }
}

module.exports = Scratch3Json;
