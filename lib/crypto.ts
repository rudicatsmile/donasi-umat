import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || "donasiumat-fallback-secret-key-32-chars!!";
  return crypto.scryptSync(secret, "donasiumat-salt-2026", KEY_LENGTH);
}

/**
 * Encrypt sensitive string data using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex encoded)
 */
export function encryptSensitiveData(text: string): string {
  if (!text) return text;
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error("Encryption failed:", err);
    throw new Error("Gagal mengenkripsi data sensitif");
  }
}

/**
 * Decrypt AES-256-GCM encrypted data.
 */
export function decryptSensitiveData(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(":")) return encryptedData;
  try {
    const [ivHex, authTagHex, cipherHex] = encryptedData.split(":");
    if (!ivHex || !authTagHex || !cipherHex) return encryptedData;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.warn("Decryption failed or invalid format, returning fallback:", err);
    return encryptedData;
  }
}

/**
 * Mask National ID (NIK / SIM / Passport):
 * Shows first 4 characters and last 2 characters, rest asterisks.
 * e.g. "3201123456780001" -> "3201**********01"
 */
export function maskIdentityNumber(idNumber: string): string {
  if (!idNumber) return "";
  const cleaned = idNumber.trim();
  if (cleaned.length <= 6) return cleaned;
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-2);
  const asterisks = "*".repeat(cleaned.length - 6);
  return `${start}${asterisks}${end}`;
}

/**
 * Mask Indonesian Phone Number:
 * e.g. "081234567890" -> "0812****7890"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length < 8) return phone;
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-4);
  return `${start}****${end}`;
}

/**
 * Mask Bank Account Number:
 * e.g. "1234567890" -> "123****890"
 */
export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber) return "";
  const cleaned = accountNumber.trim();
  if (cleaned.length <= 6) return cleaned;
  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-3);
  return `${start}****${end}`;
}

/**
 * Deterministic SHA-256 hash for secure indexing/lookup of unique sensitive identifiers
 */
export function hashSensitiveIdentifier(text: string): string {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}
