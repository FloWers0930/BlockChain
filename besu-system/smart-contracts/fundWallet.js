require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);

  // Use genesis funded account as sender
  const wallet = new ethers.Wallet(process.env.GENESIS_PRIVATE_KEY, provider);

  const recipient = process.env.MY_WALLET_ADDRESS;
  const amount = ethers.parseEther("100");

  console.log("Sending from:", wallet.address);
  console.log("Sending to:", recipient);

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
