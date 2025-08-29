import fetch from 'node-fetch';
import pkg from '@stacks/transactions';
const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  principalCV,
  uintCV,
  stringAsciiCV,
} = pkg;
import { StacksTestnet } from '@stacks/network';

const {
  AI_SERVICE_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  AI_API_ENDPOINT,
} = process.env;

const network = new StacksTestnet();

/**
 * Fetch recent transactions from Stacks testnet.
 */
export async function fetchRecentTransactions() {
  try {
    console.log('📡 Fetching recent transactions from Stacks network...');
    const res = await fetch(
      'https://api.testnet.hiro.so/extended/v1/tx?limit=20'
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`✅ Found ${data.results.length} transactions to analyze`);
    return data.results;
  } catch (err) {
    console.error('❌ Error fetching transactions:', err.message);
    return [];
  }
}

/**
 * Get risk analysis from AI API.
 */
export async function getAIAnalysis(tx) {
  if (tx.tx_type !== 'token_transfer') return null;

  const payload = {
    amount: parseInt(tx.token_transfer.amount, 10) || 0,
    frequency: Math.floor(Math.random() * 15), // Simulated frequency
    recipients: Math.floor(Math.random() * 8), // Simulated recipients
    memo: tx.token_transfer.memo || '',
    sender: tx.sender_address
  };

  try {
    console.log(`🔍 Analyzing transaction from ${tx.sender_address.substring(0, 8)}...`);
    const res = await fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`AI API responded with ${res.status}: ${res.statusText}`);
    }

    const analysis = await res.json();
    console.log(`📊 Risk Score: ${analysis.risk_score}/10, Threat: ${analysis.threat_detected ? '🚨 YES' : '✅ NO'}`);
    return analysis;
  } catch (err) {
    console.error(`❌ AI analysis error for ${tx.tx_id}:`, err.message);
    return null;
  }
}

/**
 * Report detected threat on-chain.
 */
export async function reportThreat(txSender, analysis) {
  try {
    console.log(`🚨 HIGH-RISK THREAT DETECTED! Reporting ${txSender.substring(0, 8)}... to smart contract`);

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'security-monitor',
      functionName: 'store-threat-report',
      functionArgs: [
        principalCV(txSender),
        uintCV(analysis.risk_score),
        stringAsciiCV(analysis.severity),
        stringAsciiCV(analysis.threat_category),
        uintCV(analysis.confidence_level),
      ],
      senderKey: AI_SERVICE_PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      fee: 2000,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, network);

    console.log(`✅ Threat successfully reported on-chain!`);
    console.log(`🔗 Transaction ID: ${result.txid}`);
    console.log(`🌐 View on explorer: https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);

    return result.txid;
  } catch (err) {
    console.error('❌ Error reporting threat to contract:', err.message);
    return null;
  }
}

/**
 * Run one monitoring cycle.
 */
export async function monitorCycle() {
  console.log('\n🛡️  --- StackGuard Monitoring Cycle Start ---');
  const startTime = Date.now();

  const txns = await fetchRecentTransactions();
  if (txns.length === 0) {
    console.log('⚠️  No transactions found to analyze');
    return { processed: 0, threats: 0, duration: Date.now() - startTime };
  }

  const seen = new Set();
  let processed = 0;
  let threats = 0;

  for (const tx of txns) {
    if (!tx.sender_address || seen.has(tx.sender_address)) continue;
    seen.add(tx.sender_address);
    processed++;

    const analysis = await getAIAnalysis(tx);
    if (analysis?.threat_detected) {
      threats++;
      await reportThreat(tx.sender_address, analysis);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`🏁 --- Monitoring Cycle Complete ---`);
  console.log(`📈 Processed: ${processed} addresses, Threats: ${threats}, Duration: ${duration}ms\n`);

  return { processed, threats, duration };
}
