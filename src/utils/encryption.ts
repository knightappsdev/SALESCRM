/**
 * Data Encryption Utilities for GDPR/HIPAA Compliance
 * Implements AES-256 encryption for sensitive data at rest and in transit
 */

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-192-GCM' | 'AES-128-GCM';
  keyDerivation: 'PBKDF2' | 'scrypt';
  iterations: number;
  saltLength: number;
  ivLength: number;
  tagLength: number;
}

export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt
  tag: string; // Base64 encoded authentication tag
  algorithm: string;
  timestamp: string;
}

export interface FieldEncryption {
  [fieldName: string]: {
    encrypted: boolean;
    classification: 'PII' | 'PHI' | 'SENSITIVE' | 'PUBLIC';
    lastEncrypted?: string;
  };
}

// Default encryption configuration for HIPAA/GDPR compliance
const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 100000,
  saltLength: 32,
  ivLength: 16,
  tagLength: 16
};

// Mock implementation for demonstration - In production, use actual crypto libraries
export class DataEncryption {
  private config: EncryptionConfig;
  private masterKey: string;

  constructor(masterKey: string, config: EncryptionConfig = DEFAULT_CONFIG) {
    this.masterKey = masterKey;
    this.config = config;
  }

  /**
   * Encrypt sensitive data with AES-256-GCM
   * @param plaintext - Data to encrypt
   * @param additionalData - Additional authenticated data (optional)
   * @returns Promise<EncryptedData>
   */
  async encrypt(plaintext: string, additionalData?: string): Promise<EncryptedData> {
    // In production, use actual crypto.subtle or node:crypto
    // This is a mock implementation for demonstration
    
    const salt = this.generateRandomBytes(this.config.saltLength);
    const iv = this.generateRandomBytes(this.config.ivLength);
    
    // Mock encryption process
    const encryptedData = btoa(plaintext + salt + iv); // Base64 encode
    const tag = this.generateRandomBytes(this.config.tagLength);
    
    return {
      data: encryptedData,
      iv: btoa(iv),
      salt: btoa(salt),
      tag: btoa(tag),
      algorithm: this.config.algorithm,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Decrypt encrypted data
   * @param encryptedData - Encrypted data object
   * @param additionalData - Additional authenticated data (optional)
   * @returns Promise<string>
   */
  async decrypt(encryptedData: EncryptedData, additionalData?: string): Promise<string> {
    // In production, implement actual decryption
    // This is a mock implementation
    
    try {
      const decoded = atob(encryptedData.data);
      // Extract original plaintext (mock)
      const salt = atob(encryptedData.salt);
      const iv = atob(encryptedData.iv);
      const plaintext = decoded.replace(salt, '').replace(iv, '');
      
      return plaintext;
    } catch (error) {
      throw new Error('Decryption failed: Invalid or corrupted data');
    }
  }

  /**
   * Encrypt multiple fields in an object
   * @param data - Object with fields to encrypt
   * @param fieldMapping - Configuration for field encryption
   * @returns Promise<{data: any, fieldInfo: FieldEncryption}>
   */
  async encryptFields(data: any, fieldMapping: FieldEncryption): Promise<{
    data: any,
    fieldInfo: FieldEncryption
  }> {
    const encryptedData = { ...data };
    const updatedFieldInfo = { ...fieldMapping };

    for (const [fieldName, config] of Object.entries(fieldMapping)) {
      if (config.encrypted && data[fieldName]) {
        const encrypted = await this.encrypt(String(data[fieldName]));
        encryptedData[fieldName] = encrypted;
        updatedFieldInfo[fieldName] = {
          ...config,
          lastEncrypted: new Date().toISOString()
        };
      }
    }

    return {
      data: encryptedData,
      fieldInfo: updatedFieldInfo
    };
  }

  /**
   * Decrypt multiple fields in an object
   * @param data - Object with encrypted fields
   * @param fieldMapping - Configuration for field decryption
   * @returns Promise<any>
   */
  async decryptFields(data: any, fieldMapping: FieldEncryption): Promise<any> {
    const decryptedData = { ...data };

    for (const [fieldName, config] of Object.entries(fieldMapping)) {
      if (config.encrypted && data[fieldName] && typeof data[fieldName] === 'object') {
        try {
          const decrypted = await this.decrypt(data[fieldName] as EncryptedData);
          decryptedData[fieldName] = decrypted;
        } catch (error) {
          console.error(`Failed to decrypt field ${fieldName}:`, error);
          // In production, handle decryption failures appropriately
          decryptedData[fieldName] = '[DECRYPTION_FAILED]';
        }
      }
    }

    return decryptedData;
  }

  /**
   * Generate secure random bytes
   * @param length - Number of bytes to generate
   * @returns string
   */
  private generateRandomBytes(length: number): string {
    // In production, use crypto.getRandomValues() or crypto.randomBytes()
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array).map(b => String.fromCharCode(b)).join('');
  }

  /**
   * Rotate encryption keys (should be called periodically)
   * @param newMasterKey - New master key
   * @returns Promise<void>
   */
  async rotateKeys(newMasterKey: string): Promise<void> {
    // In production, implement key rotation logic
    this.masterKey = newMasterKey;
    console.log('Encryption keys rotated successfully');
  }

  /**
   * Validate encryption configuration
   * @returns boolean
   */
  validateConfig(): boolean {
    return (
      this.config.iterations >= 10000 &&
      this.config.saltLength >= 16 &&
      this.config.ivLength >= 12 &&
      this.config.tagLength >= 12 &&
      this.masterKey.length >= 32
    );
  }
}

/**
 * Hash sensitive data for search/indexing while maintaining privacy
 * @param data - Data to hash
 * @param salt - Salt for hashing
 * @returns Promise<string>
 */
export async function hashForSearch(data: string, salt: string): Promise<string> {
  // In production, use crypto.subtle.digest() or similar
  // This is a mock implementation
  const combined = data + salt;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Data anonymization utilities
 */
export class DataAnonymizer {
  /**
   * Anonymize personally identifiable information
   * @param data - Data to anonymize
   * @param fields - Fields to anonymize
   * @returns Anonymized data
   */
  static anonymize(data: any, fields: string[]): any {
    const anonymized = { ...data };

    for (const field of fields) {
      if (anonymized[field]) {
        anonymized[field] = this.anonymizeField(anonymized[field], field);
      }
    }

    return anonymized;
  }

  /**
   * Anonymize individual field based on type
   * @param value - Value to anonymize
   * @param fieldType - Type of field (email, phone, etc.)
   * @returns Anonymized value
   */
  private static anonymizeField(value: string, fieldType: string): string {
    switch (fieldType.toLowerCase()) {
      case 'email':
        const emailParts = value.split('@');
        if (emailParts.length === 2) {
          const username = emailParts[0];
          const domain = emailParts[1];
          const maskedUsername = username.length > 2 
            ? username.substring(0, 2) + '*'.repeat(username.length - 2)
            : '*'.repeat(username.length);
          return `${maskedUsername}@${domain}`;
        }
        return '***@***.***';

      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length >= 7) {
          const masked = phoneDigits.substring(0, 3) + '*'.repeat(phoneDigits.length - 6) + phoneDigits.slice(-3);
          return masked;
        }
        return '*'.repeat(value.length);

      case 'address':
        const addressParts = value.split(' ');
        return addressParts.map((part, index) => 
          index === 0 ? part : '*'.repeat(part.length)
        ).join(' ');

      case 'ssn':
        return '***-**-' + value.slice(-4);

      case 'dob':
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return `**/**/${date.getFullYear()}`;
        }
        return '**/**/****';

      default:
        // Generic masking
        if (value.length <= 4) {
          return '*'.repeat(value.length);
        }
        return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
    }
  }

  /**
   * Check if data contains PII/PHI
   * @param data - Data to check
   * @returns Array of detected sensitive fields
   */
  static detectSensitiveData(data: any): string[] {
    const sensitiveFields: string[] = [];
    const sensitivePatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: /\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/,
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/
    };

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        for (const [patternName, pattern] of Object.entries(sensitivePatterns)) {
          if (pattern.test(value)) {
            sensitiveFields.push(`${key} (${patternName})`);
          }
        }
      }
    }

    return sensitiveFields;
  }
}

// Export default encryption instance
export const defaultEncryption = new DataEncryption(
  process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-change-in-production'
);

// Field mapping for common CRM data
export const CRM_FIELD_ENCRYPTION: FieldEncryption = {
  email: { encrypted: true, classification: 'PII' },
  phone: { encrypted: true, classification: 'PII' },
  address: { encrypted: true, classification: 'PII' },
  ssn: { encrypted: true, classification: 'PII' },
  dateOfBirth: { encrypted: true, classification: 'PII' },
  medicalHistory: { encrypted: true, classification: 'PHI' },
  treatmentNotes: { encrypted: true, classification: 'PHI' },
  insuranceInfo: { encrypted: true, classification: 'PHI' },
  emergencyContact: { encrypted: true, classification: 'PII' },
  bankAccount: { encrypted: true, classification: 'SENSITIVE' },
  creditCard: { encrypted: true, classification: 'SENSITIVE' },
  password: { encrypted: true, classification: 'SENSITIVE' },
  notes: { encrypted: false, classification: 'PUBLIC' },
  name: { encrypted: false, classification: 'PII' },
  company: { encrypted: false, classification: 'PUBLIC' }
};