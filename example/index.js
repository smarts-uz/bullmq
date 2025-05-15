import * as bull from 'bullmq';
import IoRedis from 'ioredis';

const connection = new IoRedis({
    maxRetriesPerRequest: null,
    host: 'redis-10673.c100.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 10673,
    password: 'LgTF6fp4tls2GkdjBhsERUhEUXXLhQPQ'
});

const myQueue = new bull.Queue('foo', {
    // connection: {
    //     host: 'redis-10673.c100.us-east-1-4.ec2.redns.redis-cloud.com',
    //     port: 10673,
    //     password: 'LgTF6fp4tls2GkdjBhsERUhEUXXLhQPQ'
    // }
    connection
});


async function addJobs() {
    await myQueue.add('jbo1', { foo: 'bar' }, {removeOnComplete: true, removeOnFail: true});
    await myQueue.add('job2', { qux: 'baz' }, {removeOnComplete: true, removeOnFail: true});
}

await myQueue.upsertJobScheduler(
    'repeat-every-10s',
    {
      every: 3000, // Job will repeat every 10000 milliseconds (10 seconds)
      limit: 5
    },
    { name: 'every-job', data: { jobData: 'data' }, opts: {}, // Optional additional job options
});

const worker = new bull.Worker(
    'foo',
    async job => {
        // Will print { foo: 'bar'} for the first job
        // and { qux: 'baz' } for the second.
        console.log(job.data);
        // myQueue.drain()
    },
    { connection }
);

worker.on('completed', job => {
    console.log(`${job.name} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.name} has failed with ${err.message}`);
});


// const queueEvents = new bull.QueueEvents("foo", { connection });
// queueEvents.on('waiting', ({ jobId }) => {
//     console.log(`A job with ID ${jobId} is waiting`);
//   });
  
//   queueEvents.on('active', ({ jobId, prev }) => {
//     console.log(`Job ${jobId} is now active; previous status was ${prev}`);
//   });
  
//   queueEvents.on('completed', ({ jobId, returnvalue }) => {
//     console.log(`${jobId} has completed and returned ${returnvalue}`);
//   });
  
//   queueEvents.on('failed', ({ jobId, failedReason }) => {
//     console.log(`${jobId} has failed with reason ${failedReason}`);
//   });

await addJobs();