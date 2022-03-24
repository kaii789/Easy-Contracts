const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test contract executor", function () {
    let ContractState;
    let contractState;
    let owner;
    let addr1;
    let addr2;
    let addrs;
  
    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
      // Get the ContractFactory and Signers here.
      ContractState = await ethers.getContractFactory("Linker");
  
      // A `Signer` in ethers.js is an object that represents an Ethereum account.
      // It's used to send transactions to contracts and other accounts.
      // Here we're getting a list of the accounts in the node we're connected to,
      // which in this case is Hardhat Network.
      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  
      // To deploy our contract, we just have to call ContractState.deploy() and await
      // for it to be deployed(), which happens once its transaction has been
      // mined.
      contractState = await ContractState.deploy();
    });
    
    describe("Test (judge contract balance) contract case 1", function () {
      it("Should end contract", async function () {
        /*
        We start at statement 0.
        We inject 5 ETH into the contract balance.
        We execute the contract and jump to statement 1 since we satisfy the condition (contract balance >= 5). 
        We execute the contract again and end the contract since we do not satisfy the condition (contract balance > 0 and contract balance < 0).
        
        We expect the contract's curStatement to be -1, which indicates the contract has ended.
        */

        // Create new contract.
        const createContractTx = await contractState.newContract("contract_0");
        await createContractTx.wait(); // Wait until transaction is mined.
  
        // Add statements.
        const addStatementTx1 = await contractState.addStatement(
          "contract_0",
          [{"conditionType": 0, "strArgs": [">="], "intArgs": [5], "addrArgs": []}],
          [{"actionType": 0, "strArgs": [], "intArgs": [1], "addrArgs": []}],
          [{"actionType": 0, "strArgs": [], "intArgs": [0], "addrArgs": []}]
        );
        await addStatementTx1.wait(); // Wait until transaction is mined.
        const addStatementTx2 = await contractState.addStatement(
          "contract_0",
          [{"conditionType": 0, "strArgs": [">"], "intArgs": [0], "addrArgs": []},
           {"conditionType": 0, "strArgs": ["<"], "intArgs": [0], "addrArgs": []}],
          [{"actionType": 0, "strArgs": [], "intArgs": [0], "addrArgs": []}],
          []
        );
        await addStatementTx2.wait(); // Wait until transaction is mined.
        
        // Add 5 ETH to contract balance
        let overrides = {
            value: ethers.utils.parseEther("5.0")
          };
        await contractState.connect(owner).payContract("contract_0", overrides);

        // Execute Contract: Jump to statement 1
        const executeContractTx1 = await contractState.executeContract(
            "contract_0"
        );
        await executeContractTx1.wait(); // Wait until transaction is mined.

        // Execute Contract: End contract
        const executeContractTx2 = await contractState.executeContract(
            "contract_0"
        );
        await executeContractTx2.wait(); // Wait until transaction is mined.

        // Get contract.
        const getContractTx = await contractState.getContract("contract_0");
        expect(getContractTx.isContract).to.be.true;
        expect(getContractTx.curStatement).to.equal(-1);
      });
    });

    describe("Test (judge contract balance) contract case 2", function () {
      it("Should jump to statement 1, then back to 0", async function () {
        /*
        We start at statement 0.
        We inject 5 ETH into the contract balance.
        We execute the contract and jump to statement 1 since we satisfy the condition (contract balance >= 5). 
        We execute the contract again and jump back to statement 0 since we satisfy the condition (contract balance > 1).
        
        We expect the contract's curStatement to be 0.
        */

        // Create new contract.
        const createContractTx = await contractState.newContract("contract_0");
        await createContractTx.wait(); // Wait until transaction is mined.
  
        // Add statements.
        const addStatementTx1 = await contractState.addStatement(
          "contract_0",
          [{"conditionType": 0, "strArgs": [">="], "intArgs": [5], "addrArgs": []}],
          [{"actionType": 0, "strArgs": [], "intArgs": [1], "addrArgs": []}],
          [{"actionType": 0, "strArgs": [], "intArgs": [0], "addrArgs": []}]
        );
        await addStatementTx1.wait(); // Wait until transaction is mined.
        const addStatementTx2 = await contractState.addStatement(
          "contract_0",
          [{"conditionType": 0, "strArgs": [">"], "intArgs": [1], "addrArgs": []}],
          [{"actionType": 0, "strArgs": [], "intArgs": [0], "addrArgs": []}],
          []
        );
        await addStatementTx2.wait(); // Wait until transaction is mined.
        
        // Add 5 ETH to contract balance
        let overrides = {
            value: ethers.utils.parseEther("5.0")
          };
        await contractState.connect(owner).payContract("contract_0", overrides);

        // Execute Contract: Jump to statement 1
        const executeContractTx1 = await contractState.executeContract(
            "contract_0"
        );
        await executeContractTx1.wait(); // Wait until transaction is mined.

        // Execute Contract: Jump back to statement 0
        const executeContractTx2 = await contractState.executeContract(
            "contract_0"
        );
        await executeContractTx2.wait(); // Wait until transaction is mined.

        // Get contract.
        const getContractTx = await contractState.getContract("contract_0");
        expect(getContractTx.isContract).to.be.true;
        expect(getContractTx.curStatement).to.equal(0);
      });
    });
  
  });
