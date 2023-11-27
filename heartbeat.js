const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'https://api.metronome.com/v1/ingest';
const BEARER_TOKEN = '<API TOKEN HERE>';

const CUSTOMER_IDS = ['rocky@rocky.com', 'acme@acme.com', 'evil@evilcorp.com'];

function generateHeartbeatData(customerId) {
  const transactionId = uuidv4();
  const timestamp = new Date().toISOString();

  // Determine provider with a 50/50 chance
  const provider = Math.random() < 0.5 ? 'aws' : 'gcp';

  return {
    transaction_id: transactionId,
    customer_id: customerId,
    event_type: 'heartbeat',
    timestamp: timestamp,
    properties: {
      cluster_id: '42',
      cpu_seconds: 60,
      region: 'Europe',
      provider: provider,
    },
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendHeartbeat() {
  const maxRetries = 3;

  while (true) {
    const customerDataArray = CUSTOMER_IDS.map(customerId => generateHeartbeatData(customerId));

    const payload = JSON.stringify(customerDataArray);
    console.log(`Payload: ${payload}`);

    // Log the heartbeat occurrences
    const timestamp = new Date().toISOString();
    console.log(`Heartbeat occurred at ${timestamp} for Customer IDs: ${CUSTOMER_IDS.join(', ')}`);

    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        // Make the POST request using axios
        await axios.post(API_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`,
          },
        });

        success = true;
      } catch (error) {
        console.error('Error making POST request:', error.message);
        retryCount++;
        await sleep(5000); // Wait for 5 seconds before retrying
      }
    }

    if (!success) {
      console.error(`Failed to send heartbeat after ${maxRetries} retries.`);
    }

    // Sleep for 1 minute before the next iteration
    await sleep(60000);
  }
}

// Start sending heartbeats
sendHeartbeat();

