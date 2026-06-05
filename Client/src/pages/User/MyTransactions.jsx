import { useEffect, useState } from "react";
import API from "../../api/axios";

function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  const fetchTransactions = async () => {
    try {
      const response = await API.get("/transactions/my-transactions");
      setTransactions(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load records");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>My Transactions</h2>

      {message && <p>{message}</p>}

      {transactions.map((transaction) => (
        <div key={transaction._id}>
          <hr />
          <p>Reference: {transaction.referenceNumber}</p>
          <p>Type: {transaction.transactionType}</p>
          <p>Amount: {transaction.amount}</p>
          <p>Status: {transaction.blockchainStatus}</p>
          <p>Hash: {transaction.blockchainTxHash}</p>
        </div>
      ))}
    </div>
  );
}

export default MyTransactions;
