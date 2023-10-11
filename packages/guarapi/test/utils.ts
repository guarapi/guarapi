import suppertest from 'supertest';
import forge from 'node-forge';

export function generateCertificates() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'BR' },
    { shortName: 'ST', value: 'São Paulo' },
    { name: 'localityName', value: 'São Paulo' },
    { name: 'organizationName', value: 'Organization' },
    { shortName: 'OU', value: 'Test' },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey);

  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

  return { certPem, keyPem };
}

// fix @types/supertest to receive config
export function request<T>(server: T, config?: { http2?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return suppertest(server, config);
}
