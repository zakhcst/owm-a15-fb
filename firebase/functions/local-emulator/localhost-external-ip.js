const dns = require('dns');
const os = require('os'); 

exports.getIp = () => {
    const promise = new Promise((resolve, reject) => {
        dns.lookup(os.hostname(), (err, address) => { 
            if (err) {
                reject(err);
            }
            console.log('Local emulator external ip address:', address);
            resolve(address);
        });
    });
    return promise;
}
