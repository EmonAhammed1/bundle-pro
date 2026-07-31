import fetch from 'node-fetch';

/**
 * Script to automatically add A record bundle.emonahammed.shop -> 72.244.153.23 on Cloudflare
 */
async function addDnsRecord(apiToken, globalApiKey, email) {
  const domain = 'emonahammed.shop';
  const subdomain = 'bundle';
  const ip = '72.244.153.23';

  const headers = apiToken 
    ? { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' }
    : { 'X-Auth-Email': email, 'X-Auth-Key': globalApiKey, 'Content-Type': 'application/json' };

  try {
    console.log(`🌐 Fetching Cloudflare Zone ID for ${domain}...`);
    const zonesRes = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, { headers });
    const zonesData = await zonesRes.json();

    if (!zonesData.success || !zonesData.result.length) {
      console.error('❌ Failed to find zone:', zonesData.errors);
      return;
    }

    const zoneId = zonesData.result[0].id;
    console.log(`✅ Found Zone ID: ${zoneId}`);

    console.log(`📌 Creating DNS A Record: ${subdomain}.${domain} -> ${ip}...`);
    const recordPayload = {
      type: 'A',
      name: subdomain,
      content: ip,
      ttl: 1, // Auto
      proxied: true // Orange Cloud SSL
    };

    const createRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recordPayload)
    });

    const createData = await createRes.json();
    if (createData.success) {
      console.log(`🎉 SUCCESS! DNS Record created: https://${subdomain}.${domain} -> ${ip}`);
    } else {
      console.error('❌ Failed to create DNS record:', createData.errors);
    }

  } catch (err) {
    console.error('❌ Error calling Cloudflare API:', err.message);
  }
}

// Example invocation
const token = process.env.CLOUDFLARE_API_TOKEN;
const apiKey = process.env.CLOUDFLARE_API_KEY;
const email = process.env.CLOUDFLARE_EMAIL;

addDnsRecord(token, apiKey, email);
