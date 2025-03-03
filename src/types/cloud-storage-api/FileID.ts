// import crypto from 'crypto';
// import fs from 'fs';

// async function getFileID(filePath: string, tenantKey: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const hmac = crypto.createHmac('sha3-256', tenantKey);
//     const stream = fs.createReadStream(filePath);

//     stream.on('data', chunk => hmac.update(chunk));
//     stream.on('error', err => reject(err));
//     stream.on('end', () => resolve(hmac.digest('hex')));
//     await 

//   });
// }

// getFileID(file, tenantKey)
//   .then(hash => console.log(hash))
//   .catch(err => console.error('Error calculating hash:', err));
