export type Handler = (payload: any) => Promise<void> | void;

export interface MessageQueueOptions {
    retry?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
}
