const http = require('http');

const msg = `Worker ${process.pid} is processing this request`;
const ActionsBundle = {
    '/req': async (req, res) => {
        const sendMsg = new Promise((resolve, reject) => {
            process.send({ pid: process.pid, msg}, (err, data) => { 
                if (err) reject(err);
                else resolve(data);
            });
        });
        await sendMsg;
        res.writeHead(200);
        res.end(msg);
    },
    '/getCounts': async (req, res) => {
        const sendMsg = new Promise((resolve, reject) => {
            process.send({ pid: process.pid, msg, type: 'getCounts' }, (err, data) => { 
                if (err) reject(err);
                else resolve(data);
            });
        });

        const getMsg = new Promise((resolve, reject) => {
            process.once('message', (msg) => {
                const bodyResp = JSON.stringify(msg);
                resolve(bodyResp);
            }, (err) => reject(err));
        });

        const [, bodyResp] = await Promise.all([sendMsg, getMsg]);
        res.writeHead(200);
        res.end(bodyResp);
    },
};

module.exports = http.createServer(async (req, res) => {
    if (ActionsBundle[req.url]) {
        await ActionsBundle[req.url](req, res);
    }
});