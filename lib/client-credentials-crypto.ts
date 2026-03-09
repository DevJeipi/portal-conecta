import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";

function getEncryptionKey() {
  const rawSecret = process.env.CLIENT_CREDENTIALS_ENCRYPTION_KEY;
  if (!rawSecret) {
    throw new Error(
      "Variavel CLIENT_CREDENTIALS_ENCRYPTION_KEY nao configurada no ambiente.",
    );
  }

  return createHash("sha256").update(rawSecret).digest();
}

export function encryptCredentialPassword(password: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted =
    cipher.update(password, "utf8", "base64") + cipher.final("base64");

  return {
    encrypted,
    iv: iv.toString("base64"),
  };
}

export function decryptCredentialPassword(encrypted: string, iv: string) {
  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(iv, "base64"),
  );
  return decipher.update(encrypted, "base64", "utf8") + decipher.final("utf8");
}
