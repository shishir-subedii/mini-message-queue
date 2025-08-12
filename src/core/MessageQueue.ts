import { Job } from './job'
import { Handler, MessageQueueOptions } from './types';

export class MessageQueue {
    private jobs: Job[] = [];
    private consumers = new Map<string, Handler>();
    private isProcessing = false;

    private retry: number;
    private delay: number;
    private backoff: 'linear' | 'exponential';

    constructor(opts: MessageQueueOptions = {}) {
        this.retry = opts.retry ?? 3;
        this.delay = opts.delay ?? 1000;
        this.backoff = opts.backoff ?? 'linear';
    }

    /** Producer */
    publish(topic: string, payload: any) {
        const job: Job = {
            id: Math.random().toString(36).substring(2),
            topic,
            payload,
            retries: 0,
            maxRetries: this.retry,
            baseDelay: this.delay,
            status: 'pending'
        };
        this.jobs.push(job);
        this.process();
    }

    /** Consumer */
    subscribe(topic: string, handler: Handler) {
        this.consumers.set(topic, handler);
    }

    /** Internal processing loop */
    private async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.jobs.length > 0) {
            const job = this.jobs.shift()!;
            job.status = 'processing';

            const handler = this.consumers.get(job.topic);

            if (!handler) {
                console.warn(`No consumer for topic: ${job.topic}`);
                continue;
            }

            try {
                await handler(job.payload);
                job.status = 'completed';
                console.log(`[${job.topic}] Job ${job.id} completed`);
            } catch (err) {
                job.retries += 1;
                job.lastError = err;

                if (job.retries <= job.maxRetries) {
                    job.status = 'retrying';
                    const delay = this.getDelay(job.retries, job.baseDelay);
                    console.warn(`[${job.topic}] Retry ${job.retries}/${job.maxRetries} in ${delay}ms`);
                    await this.sleep(delay);
                    this.jobs.push(job);
                } else {
                    job.status = 'failed';
                    console.error(`[${job.topic}] Job ${job.id} failed after ${job.maxRetries} retries`);
                }
            }
        }

        this.isProcessing = false;
    }

    private getDelay(retryCount: number, base: number): number {
        return this.backoff === 'exponential'
            ? base * Math.pow(2, retryCount - 1)
            : base;
    }

    private sleep(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    /** Monitoring */
    stats() {
        return {
            queueLength: this.jobs.length,
            topics: [...this.consumers.keys()]
        };
    }
}
