import fetch from "node-fetch";
import { decide } from "../decide.js";

console.log("-- START callCountByEntryPoint.js");
console.log("-- callCountByEntryPoint.js - URL=" + URL);

export async function callCountByEntryPoint() {
  let info = await decide();
  let org_id = info.org_id;
  let token = await info.fetchToken;
  let lookbackDays = 30;
  console.log(token);
  console.log("lookbackDays=" + lookbackDays);
  
  try {
    // graphQL Query
    const query = `
		 {
				#TOTAL CALLS BY Entry Point
		
				task(
					from: 1775675740000 #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days
					to: ${Date.now()} #This can be set to Date.now() in ms
					timeComparator: createdTime
					filter: {
						and: [
							{ direction: { equals: "inbound" } }
							{ channelType: { equals: telephony } }
						]
					}
					aggregations: {
						field: "id"
						type: count
						name: "Total Contacts by Entry Point"
					}
				) {
					tasks {
						lastEntryPoint {
							name
							id
						}
						aggregation {
							name
							value
						}
					}
					pageInfo {
						hasNextPage
						endCursor
					}
				}
			}
			`;
    const posts = await fetch(`https://api.wxcc-us1.cisco.com/search?orgId=${org_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query
      })
    });
    const response = await posts.json();
    let results = await response.data.task.tasks;

    return results;
  } catch (error) {
    // console.log(`network issue ${error}`);
  }

  console.log("-- END callCountByEntryPoint.js");
}
