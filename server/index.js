const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require('@noble/secp256k1');

let addressToNonceServer = {};
app.use(cors());
app.use(express.json());

const balances = {
  "0x65f3b16ee5338a26c847": 100,
  "0xdb3f22be7b93476f4685": 50,
  "0x1a3ae06c94978ab4d233": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, recoveryBit, amount, recipient, nextNonce } = req.body;
  const uint8ArrayMsg = Uint8Array.from([amount, recipient]);
  const messageHash = toHex(uint8ArrayMsg);


  const publicKey = secp.recoverPublicKey(
      messageHash,
      signature,
      recoveryBit
  );

  // hash public key to get address
  const publicKeyHash = toHex(keccak256(publicKey));
  // console.log("Public key", publicKeyHash);
  const sender = `0x${publicKeyHash.slice(-20)}`; // 20 bytes address
  // console.log("Sender = ", sender);
  //Verification
  const isValidSign = secp.verify(signature, messageHash, toHex(publicKey));
  const doesAddressExists = !sender in addressToNonceServer;
  if (!doesAddressExists) {
      addressToNonceServer = { ...addressToNonceServer, [sender]: 0 };
  }
  let isNonceValid = nextNonce === addressToNonceServer[sender] + 1;
  setInitialBalance(sender);
  setInitialBalance(recipient);
  if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
  } else if (!isValidSign) {
      res.status(400).send({ message: "Invalid Signature" });
  } else if (!isNonceValid) {
      res.status(400).send({ message: "Invalid Nonce" });
  } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      addressToNonceServer = {
          ...addressToNonceServer,
          [sender]: addressToNonceServer[sender] + 1,
      };
      res.send({
          balance: balances[sender],
          sender: sender,
          nonceFromServer: addressToNonceServer[sender],
      });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
