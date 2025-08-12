import { MessageQueue } from '../src';

const queue = new MessageQueue({ retry: 3, delay: 500, backoff: 'linear' });

// Consumer
queue.subscribe('user.save', async (user) => {
    console.log(`Saving user ${user.name}`);
    if (user.name === 'fail') throw new Error('Simulated DB fail');
    await new Promise(res => setTimeout(res, 100));
    console.log(`✅ User ${user.name} saved`);
});

// Producer
queue.publish('user.save', { name: 'Shishir' });
queue.publish('user.save', { name: 'fail' });
queue.publish('user.save', { name: 'Ram' });

// Monitor
setInterval(() => {
    console.log(queue.stats());
}, 1000);