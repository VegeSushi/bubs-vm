const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Metadata {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'metadata',
            name: 'Metadata',
            color1: '#607D8B', // Blue Grey
            color2: '#455A64',
            color3: '#263238',
            blocks: [
                {
                    opcode: 'getCurrentUrl',
                    blockType: BlockType.REPORTER,
                    text: 'current page URL'
                },
                {
                    opcode: 'getUrlHash',
                    blockType: BlockType.REPORTER,
                    text: 'URL hash'
                },
                {
                    opcode: 'getProjectID',
                    blockType: BlockType.REPORTER,
                    text: 'Scratch project ID from URL'
                },
                {
                    opcode: 'getUserAgent',
                    blockType: BlockType.REPORTER,
                    text: 'browser user agent'
                },
                {
                    opcode: 'getOperatingSystem',
                    blockType: BlockType.REPORTER,
                    text: 'operating system'
                }
            ]
        };
    }

    getCurrentUrl() {
        return window.location.href;
    }

    getUrlHash() {
        // Returns the string after the '#' in the URL (e.g., "#12345")
        return window.location.hash.replace('#', '');
    }

    getProjectID() {
        // Tries to extract the Scratch project ID if hosted on scratch.mit.edu
        // Matches URLs like https://scratch.mit.edu/projects/123456789/
        const match = window.location.pathname.match(/\/projects\/(\d+)/);
        if (match && match[1]) {
            return match[1];
        }
        
        // Fallback: If your custom site uses the URL hash like /editor.html#12345
        const hashMatch = window.location.hash.match(/\d+/);
        if (hashMatch) {
            return hashMatch[0];
        }
        
        return 'Not found';
    }

    getUserAgent() {
        return navigator.userAgent;
    }

    getOperatingSystem() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.indexOf('win') !== -1) return 'Windows';
        if (ua.indexOf('mac') !== -1) return 'macOS';
        if (ua.indexOf('cros') !== -1) return 'Chrome OS';
        if (ua.indexOf('android') !== -1) return 'Android';
        if (ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1) return 'iOS';
        if (ua.indexOf('linux') !== -1) return 'Linux';
        
        return 'Unknown';
    }
}

module.exports = Scratch3Metadata;
