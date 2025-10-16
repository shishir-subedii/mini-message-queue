# mini-message-queue

A **minimal in-memory message queue** for Node.js.  
Supports topic-based publish/subscribe, retries, and simple backoff strategies. No external dependencies or ports required.

---

## Features

- Topic-based publish/subscribe
- Retry failed jobs with linear or exponential backoff
- In-memory queue (no external services)
- Simple monitoring via queue stats
- Lightweight and minimal

---

## Installation

```bash
npm install mini-message-queue
```

---

## Repository  

Github: https://github.com/shishir-subedii/mini-message-queue

---

## Usage

Importing  
```ts
import { MessageQueue } from 'mini-message-queue';
```

Creating a queue  
```ts
const queue = new MessageQueue({
    retry: 5,           // number of retries if a job fails (default: 3)
    delay: 1000,        // base delay between retries in ms (default: 1000)
    backoff: 'exponential' // retry backoff strategy: 'linear' or 'exponential' (default: 'linear')
});
```

Subscribing to a topic   
```ts
queue.subscribe('email', async (payload) => {
    console.log('Sending email to:', payload.to);
    // simulate possible failure
    if (Math.random() < 0.3) throw new Error('Email service failed');
});
```
Publishing a job    
```ts
queue.publish('email', { to: 'user@example.com', subject: 'Hello!' });
queue.publish('email', { to: 'admin@example.com', subject: 'Alert!' });
```

Monitoring queue  
```ts
console.log(queue.stats());
// Example output:
// { queueLength: 2, topics: ['email'] }

```
---

## Options
| Option    | Type                        | Default    | Description                     |
| --------- | --------------------------- | ---------- | ------------------------------- |
| `retry`   | `number`                    | `3`        | Max number of retries per job   |
| `delay`   | `number`                    | `1000`     | Base delay between retries (ms) |
| `backoff` | `'linear' \| 'exponential'` | `'linear'` | Retry delay strategy            |

---

## Job Statuses  

Each job has a status:  

pending — waiting to be processed  

processing — currently being handled  

retrying — failed but will retry  

failed — failed after max retries  

completed — successfully processed  

---

## Example: Multiple Topics
```ts
queue.subscribe('email', async (payload) => { /* handle email */ });
queue.subscribe('sms', async (payload) => { /* handle SMS */ });

queue.publish('email', { to: 'user@example.com', subject: 'Welcome!' });
queue.publish('sms', { to: '+1234567890', message: 'Your code is 1234' });
```
---

## Notes

In-memory only: Jobs are lost if the process exits.

Single instance: No distributed processing or clustering.

Minimal: Great for small apps, testing, or prototyping.

---

## TypeScript Types
```ts
import { MessageQueueOptions, Handler } from 'mini-message-queue';

interface MessageQueueOptions {
    retry?: number;       // max retries per job
    delay?: number;       // base delay in ms
    backoff?: 'linear' | 'exponential'; // retry strategy
}

type Handler = (payload: any) => Promise<void>;
```
---
## 📄 License

MIT License
 © 2025 Shishir Subedi

---

## CONTRIBUTING
🧠 Version Bump Logic (Using phips28/gh-action-bump-version)  

That GitHub Action checks the commit messages merged into main.  
Depending on what they contain, it bumps the version as follows:  

Commit Message	Resulting Version Bump  
fix:	🔹 patch → 1.0.0 → 1.0.1  
feat:	🔸 minor → 1.0.0 → 1.1.0  
BREAKING CHANGE: or !	🔺 major → 1.0.0 → 2.0.0  
others (chore:, docs:, test:)	no bump  

✅ Examples in Your Project  
fix: resolve timeout issue (npm version becomes 1.0.1)  
feat: add status verification API(npm version becomes 1.1.0)  
feat!: change constructor to accept options object(npm version becomes 2.0.0)  
docs: update README for new config options(version stays the same)  

---
