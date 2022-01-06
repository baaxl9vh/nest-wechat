import * as crypto from 'crypto';

/**
 * 消息签名加解密类
 */
export class MessageCrypto {

  private static NONCESTR_MAX = 32;

  public static sha1 (...args: string[]): string {
    return crypto.createHash('sha1').update(args.sort().join('')).digest('hex');
  }

  public static md5 (text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  public static getAESKey (encodingAESKey: string): Buffer {
    return Buffer.from(encodingAESKey + '=', 'base64');
  }

  public static getAESKeyIV (aesKey: Buffer): Buffer {
    return aesKey.slice(0, 16);
  }

  /**
   * AES算法pkcs7 padding Encoder
   * @param buff 需要编码码的Buffer
   * @returns {Blob|ArrayBuffer|Array.<T>|string|*}
   */
  public static PKCS7Encoder (buff: Buffer) {
    const blockSize = 32;
    const strSize = buff.length;
    const amountToPad = blockSize - (strSize % blockSize);
    const pad = Buffer.alloc(amountToPad - 1);
    pad.fill(String.fromCharCode(amountToPad));
    return Buffer.concat([buff, pad]);
  }

  /**
   * AES算法pkcs7 padding Decoder
   * @param buff 需要解码的Buffer
   * @returns {Blob|ArrayBuffer|Array.<T>|string|*}
   */
  public static PKCS7Decoder (buff: Buffer) {
    let pad = buff[buff.length - 1];
    if (pad < 1 || pad > 32) {
      pad = 0;
    }
    return buff.slice(0, buff.length - pad);
  }

  /**
   * 对给定的密文进行AES解密
   * @param str 需要解密的密文
   * @param appId 可选 需要对比的appId，如果第三方回调时默认是suiteId，也可自行传入作为匹配处理
   * @returns {string} 解密后的结果
   */
  public static decrypt (aesKey: Buffer, iv: Buffer, str: string, appId: string) {
    const aesCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    aesCipher.setAutoPadding(false);
    const decipheredBuff = MessageCrypto.PKCS7Decoder(Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]));
    const data = decipheredBuff.slice(16);
    const msgLen = data.slice(0, 4).readUInt32BE(0);
    const decryptAppId = data.slice(msgLen + 4).toString();
    if (appId && appId !== decryptAppId) {
      console.log('cropId is invalid');
    } else {
      return data.slice(4, msgLen + 4).toString();
    }
  }

  /**
   * 对给定的消息进行AES加密
   * @param msg String 需要加密的明文
   * @param appId 可选 需要对比的appId，如果第三方回调时默认是suiteId，也可自行传入作为匹配处理
   * @returns {string} 加密后的结果
   */
  public static encrypt (aesKey: Buffer, iv: Buffer, msg: string, appId: string) {
    const buf = Buffer.from(msg);
    const random16 = crypto.randomBytes(16);
    const msgLen = Buffer.alloc(4);
    msgLen.writeUInt32BE(buf.length, 0);

    const rawMsg = Buffer.concat([random16, msgLen, buf, Buffer.from(appId)]);
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    const cipheredMsg = Buffer.concat([cipher.update(rawMsg), cipher.final()]);
    return cipheredMsg.toString('base64');
  }

  public static createNonceStr (length = 16) {
    length = length > MessageCrypto.NONCESTR_MAX ? MessageCrypto.NONCESTR_MAX : length;
    let str = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }

}