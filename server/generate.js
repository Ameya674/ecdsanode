import * as secp from '@noble/secp256k1';
  

for (let i = 0; i < 3; i++) {
    const privKey = secp.utils.randomPrivateKey();
    const pubKey = secp.getPublicKey(privKey);
    console.log(`Private Key ${i + 1}: `, secp.utils.bytesToHex(privKey));
    console.log(`Public Key ${i + 1}: `, secp.utils.bytesToHex(pubKey));
}
