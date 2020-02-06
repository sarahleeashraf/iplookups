const whois = require('whois-promise');
const sqlite = require('sqlite');


async function main() {

        let ip = '50.53.132.67'

        const response = await whois.json(ip);

        console.log(response);


}

main().then(console.log).catch(console.log)
