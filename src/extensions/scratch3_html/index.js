const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3HtmlParser {
    constructor(runtime) {
        this.runtime = runtime;
        this.parser = new DOMParser();
    }

    getInfo() {
        return {
            id: 'htmlparser',
            name: 'HTML Parser',
            color1: '#E34F26', // HTML5 Orange
            color2: '#C94018',
            color3: '#A33312',
            blocks: [
                {
                    opcode: 'getTextBySelector',
                    blockType: BlockType.REPORTER,
                    text: 'get text of [SELECTOR] in [HTML]',
                    arguments: {
                        SELECTOR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'h1'
                        },
                        HTML: {
                            type: ArgumentType.STRING,
                            defaultValue: '<h1>Hello Scratch!</h1>'
                        }
                    }
                },
                {
                    opcode: 'getAttributeBySelector',
                    blockType: BlockType.REPORTER,
                    text: 'get attribute [ATTR] of [SELECTOR] in [HTML]',
                    arguments: {
                        ATTR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'src'
                        },
                        SELECTOR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'img'
                        },
                        HTML: {
                            type: ArgumentType.STRING,
                            defaultValue: '<img src="cat.png">'
                        }
                    }
                },
                {
                    opcode: 'countElements',
                    blockType: BlockType.REPORTER,
                    text: 'count of [SELECTOR] in [HTML]',
                    arguments: {
                        SELECTOR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'li'
                        },
                        HTML: {
                            type: ArgumentType.STRING,
                            defaultValue: '<ul><li>1</li><li>2</li></ul>'
                        }
                    }
                }
            ]
        };
    }

    getTextBySelector(args) {
        const selector = Cast.toString(args.SELECTOR);
        const html = Cast.toString(args.HTML);
        
        try {
            const doc = this.parser.parseFromString(html, 'text/html');
            const element = doc.querySelector(selector);
            return element ? element.textContent.trim() : '';
        } catch (e) {
            return '';
        }
    }

    getAttributeBySelector(args) {
        const attr = Cast.toString(args.ATTR);
        const selector = Cast.toString(args.SELECTOR);
        const html = Cast.toString(args.HTML);
        
        try {
            const doc = this.parser.parseFromString(html, 'text/html');
            const element = doc.querySelector(selector);
            return element && element.hasAttribute(attr) ? element.getAttribute(attr) : '';
        } catch (e) {
            return '';
        }
    }

    countElements(args) {
        const selector = Cast.toString(args.SELECTOR);
        const html = Cast.toString(args.HTML);
        
        try {
            const doc = this.parser.parseFromString(html, 'text/html');
            const elements = doc.querySelectorAll(selector);
            return elements.length;
        } catch (e) {
            return 0;
        }
    }
}

module.exports = Scratch3HtmlParser;
