const { ethers } = require("ethers");
const { wallet } = require("../config/blockchain");
const contractJson = require("../abis/TransactionLedger.json");

const getContract = () => {
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractJson.abi,
    wallet
  );
};

const recordTransactionOnBlockchain = async ({
  referenceNumber,
  transactionType,
  amount,
  description,
}) => {
  const contract = getContract();

  console.log(contract);

  const tx = await contract.recordTransaction(
    referenceNumber,
    transactionType,
    amount,
    description || ""
  );

  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 1 ? "Recorded" : "Failed",
  };
};

const verifyTransactionOnBlockchain = async (referenceNumber) => {
  const contract = getContract();

  const result = await contract.verifyTransaction(referenceNumber);

  return {
    referenceNumber: result[0],
    transactionType: result[1],
    amount: result[2].toString(),
    description: result[3],
    recordedBy: result[4],
    timestamp: result[5].toString(),
    exists: result[6],
  };
};

module.exports = {
  recordTransactionOnBlockchain,
  verifyTransactionOnBlockchain,
};