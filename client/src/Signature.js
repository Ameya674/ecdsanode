import * as secp from '@noble/secp256k1';


export const generateSignature = async (amount, recipient, privateKey) => {
    const uint8Array = Uint8Array.from([amount, recipient]);
    const messageHash = secp.utils.bytesToHex(uint8Array);
    const [signature, recovery] = await secp.sign(messageHash, privateKey, {
        recovered: true,
    });

    const signatureHex = secp.utils.bytesToHex(signature);

    const recoveryBit = recovery;

    return { signatureHex, recoveryBit };
};