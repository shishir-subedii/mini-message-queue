import { Handler, MessageQueueOptions } from './types';
export declare class MessageQueue {
    private jobs;
    private consumers;
    private isProcessing;
    private retry;
    private delay;
    private backoff;
    constructor(opts?: MessageQueueOptions);
    /** Producer */
    publish(topic: string, payload: any): void;
    /** Consumer */
    subscribe(topic: string, handler: Handler): void;
    /** Internal processing loop */
    private process;
    private getDelay;
    private sleep;
    /** Monitoring */
    stats(): {
        queueLength: number;
        topics: string[];
    };
}
