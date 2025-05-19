import { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import ZetaVRF from '../abi/ZetaVRF.json';

async function waitForFulfillment(contract, requestId, min, max, onPollStatus, interval = 5000) {
  while (true) {
    try {
      onPollStatus("Checking...");
      const bounded = await contract.getRandomNumberInRange(
        requestId,
        BigInt(min),
        BigInt(max)
      );
      return bounded.toString();
    } catch (err) {
      const revertCode = err?.code;
      if (revertCode === "CALL_EXCEPTION" || err?.reason?.includes("Request not fulfilled")) {
        onPollStatus("Still waiting...");
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        throw err;
      }
    }
  }
}

export default function Home() {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [result, setResult] = useState('');
  const [pollStatus, setPollStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [txLink, setTxLink] = useState('');

  const requestRandom = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  setResult('');
  setPollStatus('');
  setLoading(true);

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      ZetaVRF.abi,
      signer
    );

    // 1. Request a random number
    const tx = await contract.requestRandomNumber();
    const receipt = await tx.wait();

    const logs = await contract.queryFilter("RandomNumberRequested", receipt.blockNumber, receipt.blockNumber);
    const event = logs.find(log => log.args && log.args.requestId);
    const requestId = event?.args?.requestId;

    if (!requestId) throw new Error("requestId not found");

    console.log("Waiting for next block to be mined...");
    setPollStatus("⏳ Waiting for next block...");

    // 2. Wait 10s for next block (or build a real listener later)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 3. Fulfill the request
    const fulfillTx = await contract.fulfillRandomNumber(requestId);
    await fulfillTx.wait();
    const fulfillHash = fulfillTx.hash;
    const txUrl = `https://zetachain-athens-3.blockscout.com/tx/${fulfillHash}`;
    setTxLink(txUrl);

    setPollStatus("✅ Fulfilled! Fetching bounded random...");

    // 4. Poll until getRandomNumberInRange() is ready
    const bounded = await waitForFulfillment(contract, requestId, min, max, setPollStatus);
    setResult(`🎲 Random result: ${bounded}`);
    setPollStatus('');

  } catch (err) {
    console.error(err);
    alert(err.message || "An unexpected error occurred");
  }

  setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>ZetaVRF Random</h1>
      <input type="number" placeholder="min" onChange={e => setMin(e.target.value)} />
      <input type="number" placeholder="max" onChange={e => setMax(e.target.value)} />
      <br /><br />
      <button onClick={requestRandom} disabled={loading}>
        {loading ? 'Requesting...' : 'Request Random Number'}
      </button>
      {pollStatus && <p>⏳ {pollStatus}</p>}
      {result && <p>{result}</p>}
      {txLink && (
      <p>
        🔗 <a href={txLink} target="_blank" rel="noopener noreferrer">View fulfillment tx on Blockscout</a>
      </p>
      )}
    </main>
  );
}

