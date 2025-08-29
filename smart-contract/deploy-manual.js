const { StacksTestnet } = require('@stacks/network');
const { 
  makeContractDeploy, 
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} = require('@stacks/transactions');
const { readFileSync } = require('fs');

// Use the testnet keys we generated
const privateKey = 'c26627ac76dd5124ece0cd7255c917e03bc327465a06112256dc58706e9a6f81';
const senderAddress = 'ST218ZTQ5WKWM5NW9FH3PW9RC5KW1WARVDWGM3CDT';

async function deployContract() {
  const network = new StacksTestnet();
  
  // Read the contract source
  const contractSource = readFileSync('./contracts/security-monitor.clar', 'utf-8');
  
  console.log('Deploying contract with address:', senderAddress);
  console.log('Contract source length:', contractSource.length);
  
  const txOptions = {
    contractName: 'security-monitor',
    codeBody: contractSource,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  try {
    console.log('Creating transaction...');
    const transaction = await makeContractDeploy(txOptions);
    
    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    console.log('Deployment successful!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('Check status at:', `https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    
    return broadcastResponse;
    
  } catch (error) {
    console.error('Deployment failed:', error);
    
    if (error.message && error.message.includes('insufficient funds')) {
      console.log('\n⚠️  INSUFFICIENT FUNDS DETECTED');
      console.log('Your testnet address needs STX tokens to deploy contracts.');
      console.log('Address:', senderAddress);
      console.log('\nPlease fund this address using:');
      console.log('1. Stacks Explorer Sandbox: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
      console.log('2. Hiro Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
      console.log('3. Community faucets (search for "stacks testnet faucet")');
      console.log('\nAfter funding, run this script again to deploy.');
    }
    
    throw error;
  }
}

// Check balance first
async function checkBalance() {
  try {
    const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/address/${senderAddress}/balances`);
    const data = await response.json();
    
    console.log('\n💰 Account Balance:');
    console.log('STX Balance:', parseInt(data.stx.balance) / 1000000, 'STX');
    console.log('Total Sent:', parseInt(data.stx.total_sent) / 1000000, 'STX');
    console.log('Total Received:', parseInt(data.stx.total_received) / 1000000, 'STX');
    
    if (parseInt(data.stx.balance) === 0) {
      console.log('\n❌ Zero balance detected - contract deployment will fail');
      console.log('Please fund the address first using the testnet faucet.');
      return false;
    } else {
      console.log('\n✅ Sufficient balance for deployment');
      return true;
    }
    
  } catch (error) {
    console.error('Error checking balance:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 StackGuard Contract Deployment Script');
  console.log('========================================');
  
  const hasFunds = await checkBalance();
  
  if (hasFunds) {
    await deployContract();
  } else {
    console.log('\n📝 Manual Funding Instructions:');
    console.log('1. Copy your testnet address:', senderAddress);
    console.log('2. Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
    console.log('3. Paste the address and request testnet STX');
    console.log('4. Wait 2-3 minutes for confirmation');
    console.log('5. Run this script again: node deploy-manual.js');
  }
}

main().catch(console.error);
