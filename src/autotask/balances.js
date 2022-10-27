const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');
const Web3 = require('web3');
const ethers = require('ethers');
const BigNumber = ethers.BigNumber;
const METAPOOL_ABI = [{"inputs":[{"internalType":"uint256","name":"i","type":"uint256"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"i","type":"uint256"}],"name":"coins","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];
const METAPOOL_ADDDRESS = '0x87650D7bbfC3A9F10587d7778206671719d9910D';
const BLOCKS_IN_5_MIN = 21;
const BLOCKS_IN_1_DAY = 6171;

// Entrypoint for the Autotask
exports.handler = async function(credentials) {
  const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
  const web3 = new Web3(provider);
 
  const metapool = new ethers.Contract(METAPOOL_ADDDRESS, METAPOOL_ABI, signer);
	
  const coin0Balance = await metapool.balances(0);
  const coin1Balance = await metapool.balances(1);
  const currentBlock = await provider.getBlockNumber();
  const coin0Balance5minAgo = await metapool.balances(0, {"blockTag": currentBlock - BLOCKS_IN_5_MIN });
  const coin1Balance5minAgo = await metapool.balances(1, {"blockTag": currentBlock - BLOCKS_IN_5_MIN });
  const coin0BalanceDayAgo = await metapool.balances(0, {"blockTag": currentBlock - BLOCKS_IN_1_DAY });
  const coin1BalanceDayAgo = await metapool.balances(1, {"blockTag": currentBlock - BLOCKS_IN_1_DAY });
  
  const balanceRateBasisPoint = coin0Balance.mul(10000).div(coin1Balance.add(coin0Balance))
  const balanceRate5MinBasisPoint = coin0Balance5minAgo.mul(10000).div(coin1Balance5minAgo.add(coin0Balance5minAgo))
  const balanceRateDayBasisPoint = coin0BalanceDayAgo.mul(10000).div(coin1BalanceDayAgo.add(coin0BalanceDayAgo))

  console.log("BalanceRate: ", balanceRateBasisPoint.toString())
  console.log("BalanceRate5MinAgo: ", balanceRate5MinBasisPoint.toString())
  console.log("BalanceRateDayAgo: ", balanceRateDayBasisPoint.toString())

  return false;
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  exports.handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}