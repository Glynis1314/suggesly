const net = require('net');

const hosts = [
  'cluster0-shard-00-00.62ppsb3.mongodb.net',
  'cluster0-shard-00-01.62ppsb3.mongodb.net',
  'cluster0-shard-00-02.62ppsb3.mongodb.net'
];
const port = 27017;
const timeoutMs = 5000;

async function testHost(host) {
  return new Promise((resolve) => {
    console.log(`Attempting TCP connection to ${host}:${port}...`);
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      console.log(`[SUCCESS] Connected to ${host}:${port}`);
      socket.destroy();
      resolved = true;
      resolve(true);
    });

    socket.on('error', (err) => {
      if (!resolved) {
        console.log(`[FAILED] Connection to ${host}:${port} refused/failed: ${err.message}`);
        socket.destroy();
        resolved = true;
        resolve(false);
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        console.log(`[TIMEOUT] Connection to ${host}:${port} timed out after ${timeoutMs}ms`);
        socket.destroy();
        resolved = true;
        resolve(false);
      }
    });
  });
}

async function runTests() {
  const results = [];
  for (const host of hosts) {
    const success = await testHost(host);
    results.push(success);
    console.log('--------------------------------------------------');
  }

  const allFailed = results.every(res => res === false);
  if (allFailed) {
    console.log("\nYour network is blocking port 27017 outbound — this is not a code or Atlas configuration issue.\n");
  } else {
    console.log("\nSome or all connections succeeded. Please look elsewhere for connection issues.\n");
  }
}

runTests();
