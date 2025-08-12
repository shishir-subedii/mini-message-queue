export class MessageQueue {
    constructor(opts = {}) {
        var _a, _b, _c;
        this.jobs = [];
        this.consumers = new Map();
        this.isProcessing = false;
        this.retry = (_a = opts.retry) !== null && _a !== void 0 ? _a : 3;
        this.delay = (_b = opts.delay) !== null && _b !== void 0 ? _b : 1000;
        this.backoff = (_c = opts.backoff) !== null && _c !== void 0 ? _c : 'linear';
    }
    /** Producer */
    publish(topic, payload) {
        const job = {
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
    subscribe(topic, handler) {
        this.consumers.set(topic, handler);
    }
    /** Internal processing loop */
    async process() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        while (this.jobs.length > 0) {
            const job = this.jobs.shift();
            job.status = 'processing';
            const handler = this.consumers.get(job.topic);
            if (!handler) {
                console.warn(`⚠️ No consumer for topic: ${job.topic}`);
                continue;
            }
            try {
                await handler(job.payload);
                job.status = 'completed';
                console.log(`✅ [${job.topic}] Job ${job.id} completed`);
            }
            catch (err) {
                job.retries += 1;
                job.lastError = err;
                if (job.retries <= job.maxRetries) {
                    job.status = 'retrying';
                    const delay = this.getDelay(job.retries, job.baseDelay);
                    console.warn(`🔁 [${job.topic}] Retry ${job.retries}/${job.maxRetries} in ${delay}ms`);
                    await this.sleep(delay);
                    this.jobs.push(job);
                }
                else {
                    job.status = 'failed';
                    console.error(`❌ [${job.topic}] Job ${job.id} failed after ${job.maxRetries} retries`);
                }
            }
        }
        this.isProcessing = false;
    }
    getDelay(retryCount, base) {
        return this.backoff === 'exponential'
            ? base * Math.pow(2, retryCount - 1)
            : base;
    }
    sleep(ms) {
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
