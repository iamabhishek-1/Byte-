const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

class EncryptionUtil {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH);
  }

  // Generate a random key for client-side encryption
  generateKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  }

  // Encrypt data
  encrypt(text, key = null) {
    try {
      const encryptionKey = key ? Buffer.from(key, 'hex') : this.encryptionKey;
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher(ALGORITHM, encryptionKey, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  // Decrypt data
  decrypt(encryptedData, key = null) {
    try {
      const encryptionKey = key ? Buffer.from(key, 'hex') : this.encryptionKey;
      const { encrypted, iv, authTag } = encryptedData;
      
      const decipher = crypto.createDecipher(ALGORITHM, encryptionKey, Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Hash password with salt
  hashPassword(password) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    
    return {
      salt: salt.toString('hex'),
      hash: hash.toString('hex')
    };
  }

  // Verify password
  verifyPassword(password, salt, hash) {
    const hashBuffer = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 10000, 64, 'sha512');
    return hash === hashBuffer.toString('hex');
  }

  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Create HMAC signature
  createSignature(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  // Verify HMAC signature
  verifySignature(data, signature, secret) {
    const expectedSignature = this.createSignature(data, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  // Encrypt file buffer
  encryptFile(buffer, key = null) {
    try {
      const encryptionKey = key ? Buffer.from(key, 'hex') : this.encryptionKey;
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher(ALGORITHM, encryptionKey, iv);
      
      const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      throw new Error('File encryption failed: ' + error.message);
    }
  }

  // Decrypt file buffer
  decryptFile(encryptedData, key = null) {
    try {
      const encryptionKey = key ? Buffer.from(key, 'hex') : this.encryptionKey;
      const { encrypted, iv, authTag } = encryptedData;
      
      const decipher = crypto.createDecipher(ALGORITHM, encryptionKey, Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      
      return decrypted;
    } catch (error) {
      throw new Error('File decryption failed: ' + error.message);
    }
  }
}

module.exports = new EncryptionUtil();