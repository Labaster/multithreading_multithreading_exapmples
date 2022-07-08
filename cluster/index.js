const cluster = require('cluster');
const server = require('./server');
const storage = require('./state');

const numCPUs = require('os').cpus().length;

const PORT = process.env.PORT || 7000;

const messageHandler = ({ pid = 0, msg = '', type = '' } = {}) => {
    if (pid && msg) {
        console.log(`Worker ${pid} says: ${msg}`);
        storage.add(pid, 1);

        if (type === 'getCounts') {
            const workerId = storage.get('workersMapping') && storage.get('workersMapping')[pid]
                ? storage.get('workersMapping')[pid] : 0;
            const worker = cluster.workers[workerId];
            worker.send(Object.fromEntries(storage.get()));
        }
    }
};

if (cluster.isMaster) {
    console.log(`We have ${numCPUs} CPUs`);
    const workersMapping = {};

    // Fork workers
    for (let i = 0; i < numCPUs / 4; i += 1) {
        cluster.fork();
        console.log(`Forked worker ${i}`);
    }

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', messageHandler);
        const workerPid = cluster.workers[id].process && cluster.workers[id].process.pid
            ? cluster.workers[id].process.pid : 0;
        
        if (workerPid) workersMapping[workerPid] = id;
    }

    storage.set('workersMapping', workersMapping);

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    });

    console.log(`Server running at http://localhost:${PORT}`);
} else {  // Worker
    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} is started`);
    });
}

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', (err) => {
        console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
        console.error(err.stack)
        process.exit(1)
    });