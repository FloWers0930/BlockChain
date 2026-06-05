import { useState } from "react";
import API from "../../api/axios";

function CreateTransaction() {
  const [formData, setFormData] = useState({
    transactionType: "",
    amount: "",
    description: "",
  });

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Recording transaction...");

    try {
      const response = await API.post("/transactions", {
        ...formData,
        amount: Number(formData.amount),
      });

      setResult(response.data.transaction);
      setMessage("Transaction recorded successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Transaction failed");
    }
  };

  return (
    <div>
      <h2>Create Transaction</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="transactionType"
          placeholder="Transaction Type"
          onChange={handleChange}
          required
        />

        <input
          name="amount"
          type="number"
          placeholder="Amount"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />

        <button type="submit">Record Transaction</button>
      </form>

      {result && (
        <div>
          <h3>Blockchain Record</h3>
          <p>Reference Number: {result.referenceNumber}</p>
          <p>Status: {result.blockchainStatus}</p>
          <p>Transaction Hash: {result.blockchainTxHash}</p>
          <p>Block Number: {result.blockchainBlockNumber}</p>
        </div>
      )}
    </div>
  );
}

export default CreateTransaction;
