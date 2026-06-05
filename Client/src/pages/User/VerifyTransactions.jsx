import { useState } from "react";
import API from "../../api/axios";

function VerifyTransaction() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();

    try {
      const response = await API.get(
        `/transactions/verify/${referenceNumber}`
      );

      setResult(response.data);
      setMessage("Verification completed.");
    } catch (error) {
      setResult(null);
      setMessage(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div>
      <h2>Verify Transaction</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleVerify}>
        <input
          placeholder="Enter Reference Number"
          value={referenceNumber}
          onChange={(event) => setReferenceNumber(event.target.value)}
          required
        />

        <button type="submit">Verify</button>
      </form>

      {result && (
        <div>
          <h3>Verification Result</h3>
          <p>Verified: {result.verified ? "Yes" : "No"}</p>
          <p>Reference Number: {result.blockchainRecord.referenceNumber}</p>
          <p>Type: {result.blockchainRecord.transactionType}</p>
          <p>Amount: {result.blockchainRecord.amount}</p>
          <p>Recorded By: {result.blockchainRecord.recordedBy}</p>
          <p>Blockchain Timestamp: {result.blockchainRecord.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export default VerifyTransaction;
