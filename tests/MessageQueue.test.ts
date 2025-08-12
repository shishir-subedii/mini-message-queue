import { describe, it, expect } from 'vitest';
import { MessageQueue } from '../src';

describe('MessageQueue', () => {
    it('retries failed jobs', async () => {
        let attempts = 0;
        const queue = new MessageQueue({ retry: 3, delay: 10 });

        queue.subscribe('test', async () => {
            attempts++;
            if (attempts < 3) throw new Error('Fail');
        });

        queue.publish('test', {});

        await new Promise(res => setTimeout(res, 200));
        expect(attempts).toBe(3);
    });
});
