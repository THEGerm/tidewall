// AES-GCM encryption for provider keys. The 32-byte master key is the Worker
// secret KEY_ENC_SECRET (base64); it never leaves Cloudflare.

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function masterKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", unb64(secret), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encrypt(secret: string, plaintext: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const sealed = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await masterKey(secret), data);
  return { ciphertext: b64(new Uint8Array(sealed)), iv: b64(iv) };
}

export async function decrypt(secret: string, ciphertext: string, iv: string): Promise<string> {
  const opened = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(iv) },
    await masterKey(secret),
    unb64(ciphertext),
  );
  return new TextDecoder().decode(opened);
}
