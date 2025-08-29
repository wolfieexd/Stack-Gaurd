import crypto from 'crypto';

const mnemonic = "twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw";

function generatePrivateKey() {
  // Generate a random 32-byte private key (64 hex characters)
  const privateKeyBytes = crypto.randomBytes(32);
  const privateKeyHex = privateKeyBytes.toString('hex');
  console.log('Private Key:', privateKeyHex);
  console.log('Length:', privateKeyHex.length, 'characters');
}

generatePrivateKey();
