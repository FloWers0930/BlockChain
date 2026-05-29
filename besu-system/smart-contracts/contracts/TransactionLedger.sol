// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransactionLedger {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender; // deployer wallet = your server wallet
    }

    struct TransactionRecord {
        string referenceNumber;
        string transactionType;
        uint256 amount;
        string description;
        address recordedBy;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => TransactionRecord) private transactions;

    event TransactionRecorded(
        string referenceNumber,
        string transactionType,
        uint256 amount,
        address indexed recordedBy,
        uint256 timestamp
    );

    // ✅ Only server wallet can record transactions
    function recordTransaction(
        string memory _referenceNumber,
        string memory _transactionType,
        uint256 _amount,
        string memory _description
    ) public onlyOwner {
        require(
            !transactions[_referenceNumber].exists,
            "Transaction already exists"
        );

        transactions[_referenceNumber] = TransactionRecord({
            referenceNumber: _referenceNumber,
            transactionType: _transactionType,
            amount: _amount,
            description: _description,
            recordedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit TransactionRecorded(
            _referenceNumber,
            _transactionType,
            _amount,
            msg.sender,
            block.timestamp
        );
    }

    // verifyTransaction stays public — anyone can read
    function verifyTransaction(
        string memory _referenceNumber
    )
        public
        view
        returns (
            string memory referenceNumber,
            string memory transactionType,
            uint256 amount,
            string memory description,
            address recordedBy,
            uint256 timestamp,
            bool exists
        )
    {
        TransactionRecord memory record = transactions[_referenceNumber];

        return (
            record.referenceNumber,
            record.transactionType,
            record.amount,
            record.description,
            record.recordedBy,
            record.timestamp,
            record.exists
        );
    }
}