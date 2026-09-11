const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Notifications {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'notifications',
            name: 'Notifications',
            color1: '#FF4D6A', // Main block color (Vibrant Rose)
            color2: '#E63956', // Border/Hover color (Slightly darker)
            color3: '#CC2240', // Shadow/Click color (Deep Rose)
            blocks: [
                {
                    opcode: 'askPermission',
                    blockType: BlockType.COMMAND,
                    text: 'ask for notification permission'
                },
                {
                    opcode: 'getPermissionStatus',
                    blockType: BlockType.REPORTER,
                    text: 'notification permission status'
                },
                {
                    opcode: 'sendNotification',
                    blockType: BlockType.COMMAND,
                    text: 'send notification title: [TITLE] text: [TEXT]',
                    arguments: {
                        TITLE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Scratch Alert'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Your project needs attention!'
                        }
                    }
                }
            ]
        };
    }

    /**
     * Command block - Prompts the browser for notification permission.
     * Yields the Scratch thread until the user clicks Allow/Block.
     */
    askPermission() {
        if ('Notification' in window) {
            // Notification.requestPermission() returns a Promise in modern browsers
            return Notification.requestPermission().catch(err => {
                console.warn('Error requesting notification permission: ', err);
            });
        }
    }

    /**
     * Reporter block - Returns 'granted', 'denied', or 'default'
     */
    getPermissionStatus() {
        if ('Notification' in window) {
            return Notification.permission;
        }
        return 'unsupported';
    }

    /**
     * Command block - Sends a browser notification if permission is granted
     */
    sendNotification(args) {
        const title = Cast.toString(args.TITLE);
        const text = Cast.toString(args.TEXT);
        
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                try {
                    new Notification(title, { body: text });
                } catch (e) {
                    console.warn('Failed to send notification: ', e);
                }
            } else {
                console.warn('Cannot send notification: Permission is ', Notification.permission);
            }
        }
    }
}

module.exports = Scratch3Notifications;
