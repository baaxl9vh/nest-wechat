import * as crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';

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
   * @param {Buffer} buff 
   * @returns 
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
   * @param {Buffer} buff 需要解码的Buffer
   * @returns 
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
   * @param {Buffer} aesKey 
   * @param {Buffer} iv 
   * @param {String} str 
   * @returns 
   */
  public static decrypt (aesKey: Buffer, iv: Buffer, str: string) {
    const aesCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    aesCipher.setAutoPadding(false);
    const decipheredBuff = MessageCrypto.PKCS7Decoder(Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]));
    const data = decipheredBuff.slice(16);
    const msgLen = data.slice(0, 4).readUInt32BE(0);
    return data.slice(4, msgLen + 4).toString();
  }

  /**
   * 对给定的消息进行AES加密
   * @param {Buffer} aesKey 
   * @param {Buffer} iv 
   * @param {String} msg 需要加密的明文
   * @param {String} appId 需要对比的appId，如果第三方回调时默认是suiteId，也可自行传入作为匹配处理
   * @returns 
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

  /**
   * 生成随机字符串
   * @param {number} length 长度，默认16
   * @returns 
   */
  public static createNonceStr (length = 16): string {
    length = length > MessageCrypto.NONCESTR_MAX ? MessageCrypto.NONCESTR_MAX : length;
    let str = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }

  /**
   * 消息加密
   * @param {string} appId appId
   * @param {string} token 消息token
   * @param {string} encodingAESKey 消息AES KEY
   * @param {string} message 明文
   * @param {string} timestamp 时间戳
   * @param {string} nonce 随机字符串
   * @returns {string} XML格式字符串 <xml><Encrypt></Encrypt><MsgSignature></MsgSignature><TimeStamp></TimeStamp><Nonce></Nonce></xml>
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
   */
  public static encryptMessage (appId: string, token: string, encodingAESKey: string, message: string, timestamp: string, nonce: string): string {
    const aesKey = MessageCrypto.getAESKey(encodingAESKey);
    const iv = MessageCrypto.getAESKeyIV(aesKey);
    const encrypt = MessageCrypto.encrypt(aesKey, iv, message, appId);
    const signature = MessageCrypto.sha1(token, timestamp, nonce, encrypt);
    const xml = `<xml><Encrypt><![CDATA[${encrypt}]]></Encrypt><MsgSignature><![CDATA[${signature}]]></MsgSignature><TimeStamp>${timestamp}</TimeStamp><Nonce><![CDATA[${nonce}]]></Nonce></xml>`;
    return xml;
  }

  /**
   * 
   * 消息解密
   * 
   * @param signature 签名
   * @param timestamp 时间戳
   * @param nonce 随机字符串
   * @param encryptXml 加密消息XML字符串
   * @returns 消息明文内容
   * @throws
   * @see MessageCrypto#encryptMessage
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
   * 
   */

  /**
   * 消息解密
   * @param {string} token 消息token
   * @param {string} encodingAESKey 消息AES Key
   * @param {string} signature 消息签名
   * @param {string} timestamp 消息时间戳
   * @param {string} nonce 消息随机字符串
   * @param {string} encryptXml 消息密文
   * @returns 
   * @throws
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
   */
  public static decryptMessage (token: string, encodingAESKey: string, signature: string, timestamp: string, nonce: string, encryptXml: string) {
    const aesKey = MessageCrypto.getAESKey(encodingAESKey || '');
    const iv = MessageCrypto.getAESKeyIV(aesKey);
    const parser = new XMLParser();
    const xml = parser.parse(encryptXml).xml;
    const encryptMessage = xml.Encrypt;
    if (signature !== MessageCrypto.sha1(token || '', timestamp, nonce, encryptMessage)) {
      throw new Error('signature incorrect');
    }
    return MessageCrypto.decrypt(aesKey, iv, encryptMessage);
  }

}