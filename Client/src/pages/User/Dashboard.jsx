import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <p>Welcome, {user?.fullName}</p>

      <nav>
        <p>
          <Link to="/create-transaction">Create Transaction</Link>
        </p>
        <p>
          <Link to="/my-transactions">My Transactions</Link>
        </p>
        <p>
          <Link to="/verify-transaction">Verify Transaction</Link>
        </p>
      </nav>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;
