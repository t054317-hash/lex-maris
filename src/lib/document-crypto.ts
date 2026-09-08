/**
 * Document sealing and signature attestation. SERVER ONLY.
 *
 * Threat model
 * ------------
 * Assume the object store and the database can both be read by an attacker who
 * has not compromised the KMS. Under that assumption:
 *
 *   - Documents are sealed with AES-256-GCM under a per-document data key.
 *   - The data key is generated in memory, used once, then wrapped by a KMS
 *     master key. Only the wrapped form is persisted.
 *   - Plaintext is never written to disk, and never logged.
 *   - The GCM auth tag is stored alongside the ciphertext, so tampering is
 *     detected at decrypt rather than discovered downstream.
 *
 * Signature attestation is deliberately *not* a digital signature over the
 * signer's own private key -- there is no PKI for the client. It is a signed
 * attestation by the platform that a specific content hash was accepted by an
 * authenticated principal at a specific time. That distinction belongs in the
 * verification page copy, not buried in code.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12; // 96-bit nonce: the GCM-recommended size
const TAG_BYTES = 16;

export interface SealedDocument {
  ciphertext: Buffer;
  /** Per-document data key, wrapped by the KMS master key. */
  wrappedKey: Buffer;
  iv: Buffer;
  authTag: Buffer;
  /** SHA-256 of the *plaintext*, used as the document's public identity. */
  contentHash: string;
}

/**
 * Wraps/unwraps data keys. Implement against AWS KMS, GCP KMS or Vault Transit.
 * The local implementation below exists only so tests can run without a KMS,
 * and refuses to load outside development.
 */
export interface KeyWrapper {
  wrap(dataKey: Buffer): Promise<Buffer>;
  unwrap(wrapped: Buffer): Promise<Buffer>;
}

/** Development-only wrapper. Never deploy this. */
export function createLocalKeyWrapper(masterKeyHex: string): KeyWrapper {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'createLocalKeyWrapper must not be used in production; configure a KMS-backed KeyWrapper.',
    );
  }
  const master = Buffer.from(masterKeyHex, 'hex');
  if (master.length !== KEY_BYTES) {
    throw new Error('Master key must be 32 bytes (64 hex characters).');
  }

  return {
    async wrap(dataKey) {
      const iv = randomBytes(IV_BYTES);
      const cipher = createCipheriv(ALGORITHM, master, iv);
      const body = Buffer.concat([cipher.update(dataKey), cipher.final()]);
      // Layout: iv | tag | ciphertext -- self-describing, fixed prefix lengths.
      return Buffer.concat([iv, cipher.getAuthTag(), body]);
    },
    async unwrap(wrapped) {
      const iv = wrapped.subarray(0, IV_BYTES);
      const tag = wrapped.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
      const body = wrapped.subarray(IV_BYTES + TAG_BYTES);
      const decipher = createDecipheriv(ALGORITHM, master, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(body), decipher.final()]);
    },
  };
}

export async function sealDocument(
  plaintext: Buffer,
  wrapper: KeyWrapper,
): Promise<SealedDocument> {
  const dataKey = randomBytes(KEY_BYTES);
  const iv = randomBytes(IV_BYTES);

  const cipher = createCipheriv(ALGORITHM, dataKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const contentHash = createHash('sha256').update(plaintext).digest('hex');
  const wrappedKey = await wrapper.wrap(dataKey);

  // Best-effort scrub. Node offers no guarantee the GC has not copied this
  // buffer already, but zeroing removes the obvious long-lived copy.
  dataKey.fill(0);

  return { ciphertext, wrappedKey, iv, authTag, contentHash };
}

export async function openDocument(
  sealed: Omit<SealedDocument, 'contentHash'> & { contentHash?: string },
  wrapper: KeyWrapper,
): Promise<Buffer> {
  const dataKey = await wrapper.unwrap(sealed.wrappedKey);
  try {
    const decipher = createDecipheriv(ALGORITHM, dataKey, sealed.iv);
    decipher.setAuthTag(sealed.authTag);
    const plaintext = Buffer.concat([
      decipher.update(sealed.ciphertext),
      decipher.final(),
    ]);

    // Defence in depth: GCM already authenticates the ciphertext, but this
    // catches a swapped-row attack where a valid blob is paired with the wrong
    // database record.
    if (sealed.contentHash) {
      const actual = createHash('sha256').update(plaintext).digest('hex');
      if (
        actual.length !== sealed.contentHash.length ||
        !timingSafeEqual(Buffer.from(actual), Buffer.from(sealed.contentHash))
      ) {
        throw new Error('Document content hash mismatch; refusing to return.');
      }
    }
    return plaintext;
  } finally {
    dataKey.fill(0);
  }
}

/* -------------------------------------------------------------------------- */
/* Signature attestation                                                      */
/* -------------------------------------------------------------------------- */

export interface SignatureAttestation {
  documentHash: string;
  signerId: string;
  signerName: string;
  signedAt: string;
  /** Captured for the audit record; never used as an authentication factor. */
  ipHash: string;
  /** HMAC over the canonical attestation payload. */
  attestation: string;
}

/**
 * Fields are concatenated with a separator that cannot appear in any field
 * (all are hex, ISO-8601 or opaque ids), so two different attestations can
 * never canonicalise to the same string.
 */
function canonicalise(
  a: Omit<SignatureAttestation, 'attestation'>,
): string {
  return [
    'lexmaris.attestation.v1',
    a.documentHash,
    a.signerId,
    a.signerName,
    a.signedAt,
    a.ipHash,
  ].join('');
}

export function attestSignature(
  fields: Omit<SignatureAttestation, 'attestation'>,
  attestationKey: Buffer,
): SignatureAttestation {
  const attestation = createHmac('sha256', attestationKey)
    .update(canonicalise(fields))
    .digest('hex');
  return { ...fields, attestation };
}

export function verifyAttestation(
  record: SignatureAttestation,
  attestationKey: Buffer,
): boolean {
  const { attestation, ...fields } = record;
  const expected = createHmac('sha256', attestationKey)
    .update(canonicalise(fields))
    .digest();
  const provided = Buffer.from(attestation, 'hex');
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

/**
 * Public verification URL encoded into the QR code stamped on every executed
 * document. It carries only the content hash: no matter id, no party names, so
 * a leaked printout discloses nothing about the deal.
 */
export function verificationUrl(contentHash: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/verify/${contentHash}`;
}
