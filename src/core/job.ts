export interface Job {
    id: string;
    topic: string;
    payload: any;
    retries: number;
    maxRetries: number;
    baseDelay: number;
    status: 'pending' | 'processing' | 'retrying' | 'failed' | 'completed';
    lastError?: any;
}
