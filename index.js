const parse = require('csv-parse/lib/sync');
const whois = require('whois-promise');
const sqlite = require('sqlite');
const fs = require('fs');

/*const parser = parse({delimiter: ','});*/

async function sleep() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2000)
    });
}

async function main() {
    const db = await sqlite.open('./data/three_or_more_feedback_emails.db');

    //create table if we need to

    try {
        await db.run("create table if not exists request_ips('ip','owner', num_events);");
    } catch(e) {
        console.log('error', e);
    }

    const fileContent = fs.readFileSync('./data/three_or_more_click_emails.csv');

    const records = parse(fileContent);
    records.shift(); /* get rid of the headers */

    const numRecords = records.length;
    let numRequests = 0;

    for await (const record of records) {
        [ip, num_clicks] = record;

        numRequests++;

        let minutesLeft = Math.round((numRecords - numRequests) * 2 / 60);
        let hoursLeft = 0;

        if (minutesLeft >= 60) {
            hoursLeft = Math.round(minutesLeft / 60);
        }

        console.log(`${numRequests}/${numRecords}`); 

        if (hoursLeft > 0) {
            console.log(`${hoursLeft} hours left`)
        } else {
            console.log(`${minutesLeft} minutes left`)
        }


        // look it up in the sqlite db first

        let request_ip = await db.get("SELECT * FROM request_ips where ip = ?", ip);

        if (request_ip && request_ip.owner) {
            console.log("already found");
        } else {
            const response = await whois.json(ip, {follow: 1});
            console.log(ip);

            let organization = response.organization 
                || response.orgName 
                || response.descr 
                || response.owner 
                || response['org-Name']
                || response.person
                || response['updated-By'];

            if (organization == undefined) {
                console.log(response);
                
            } else {
                if (organization.match(/barracuda/i))
                    organization = "Barracuda"

                if (organization.match(/sprint/i)) {
                    organization = "Sprint"
                }

                if (organization.match(/at&t/i)) {
                    organization = "AT&T"
                }

                if (organization.match(/amazon/i)) {

                    if (response.orgTechName.match(/EC2 Network Operations/)) {
                        organization = 'EC2 Network Operations'
                    } else {
                        organization = response.orgTechName
                    }
                }

                if (organization.match(/CenturyLink/i)) {
                    organization = "CenturyLink"
                }

                if (organization.match(/Charter/i)) {
                    organization = "Charter"
                }

                if (organization.match(/Comcast/i)) {
                    organization = "Comcast"
                }

                if (organization.match(/Google/i) && !organization.match(/fiber/i)) {
                    organization = "Google"
                }

                if (organization.match(/Cox/i)) {
                    organization = "Cox"
                }

                if (organization.match(/Verizon/i)) {
                    organization = "Verizon"
                }

                if (organization.match(/Optimum/i)) {
                    organization = "Optimum"
                }

                if (organization.match(/Web2objects/i)) {
                    organization = "Web2Objects"
                }

                if (organization.match(/ColoCrossing/i)) {
                    organization = "ColoCrossing"
                }

                if (organization.match(/Level 3/i)) {
                    organization = "Level 3"
                }

                if (organization.match(/Nobis/i)) {
                    organization = "Nobis Technology Group"
                }

                if (organization.match(/M247/i)) {
                    organization = "M247"
                }

                if (organization.match(/Frontier/i)) {
                    organization = "Frontier"
                }

                if (organization.match(/RCN/i)) {
                    organization = "RCN"
                }

                if (organization.match(/CBL1/i)) {
                    organization = "Cable One/Sparklight"
                }

                if (organization.match(/mediacom/i)) {
                    organization = "Mediacom"
                }

                if (organization.match(/sonic/i)) {
                    organization = "Sonic Net"
                }

                if (organization.match(/hotwire/i)) {
                    organization = "Hotwire Communications"
                }

                if (organization.match(/fuse/i)) {
                    organization = "Fuse Internet Access"
                }

                if (organization.match(/atlantic broadband finance/i)) {
                    organization = "Atlantic Broadband Finance"
                }

                if (organization.match(/cdn77/i)) {
                    organization = "CDN77"
                }

                if (organization.match(/CHINANET/i)) {
                    organization = "CHINANET"
                }

                if (organization.match(/Cablevision/i)) {
                    organization = "Cablevision"
                }

                if (organization.match(/Consolidated Communications/i)) {
                    organization = "Consolidated Communications"
                }

                if (organization.match(/Digital ?Ocean/i)) {
                    organization = "Digital Ocean"
                }

                if (organization.match(/Fairpoint/i)) {
                    organization = "Fairpoint Communications"
                }

                if (organization.match(/Internap/i)) {
                    organization = "Internap"
                }

                if (organization.match(/Northland/i)) {
                    organization = "Northland Cable Television"
                }

                if (organization.match(/North Carolina Research and Education/i)) {
                    organization = "North Caroline Research and Education"
                }

                if (organization.match(/PenteleData/i)) {
                    organization = "PenTeleData"
                }

                if (organization.match(/Symantec/i)) {
                    organization = "Symantec"
                }

                if (organization.match(/TPx Communications/i)) {
                    organization = "TPx Communications"
                }

            }

            console.log(organization);
            console.log('num_clicks',num_clicks);

            // insert into the sqlite db, lookup owner and then update or insert

            if (request_ip) {
                await db.run("UPDATE request_ips SET owner = ? where ip = ?", organization, ip);
            } else {
                await db.run("INSERT INTO request_ips ('ip','owner','num_events') VALUES (?,?,?)", ip, organization, num_clicks);
            }

            await sleep();
        }
    };

    return accumulator;
}


main().then(console.log).catch(console.log);
