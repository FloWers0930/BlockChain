require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const recipient = process.env.MY_WALLET_ADDRESS;
  const amount = ethers.parseEther("100"); // send 100 ETH

  console.log("Sending from:", wallet.address);

  const tx = await wallet.sendTransaction({
    to: recipient,
    value: amount,
  });

  await tx.wait();
  console.log("Transfer complete! TX hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
