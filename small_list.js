const whois = require('whois-promise');


async function main() {
    const ips = [];

    for await (const ip of ips) {
        let response =  await whois.json(ip, {follow: 0});
    }



};


main().finally(console.log);
