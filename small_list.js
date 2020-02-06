const whois = require('whois-promise');


async function main() {
    const ips = [
        '64.20.30.196',
        '24.140.3.5',
        '64.233.172.80',
        '66.249.89.56',
        '216.21.170.202',
        '207.237.69.71',
        '24.220.112.165',
        '216.68.248.7',
        '63.117.14.133',
        '66.249.89.54',
        '204.186.215.7',
        '208.124.110.69',
        '209.141.121.198',
        '143.215.193.196',
        '66.249.89.56',
        '63.117.14.71',
    ]

    for await (const ip of ips) {
        let response =  await whois.json(ip, {follow: 0});
    }



};


main().finally(console.log);
