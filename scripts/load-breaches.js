"use strict";

const arg = require("arg");
const got = require("got");

const AppConstants = require("../app-constants");
const DBUtils = require("../db/utils");
const pkg = require("../package.json");

const HIBP_USER_AGENT = `${pkg.name}/${pkg.version}`;


const args = arg({
  "--createAMBreach": Boolean,
  "--help": Boolean,
});

if (args["--help"]) {
  console.log("Usage: node load-breaaches.js [--createAMBreach]");
  console.log("--createAMBreach creates the 'AllMusic' test fixture breach.");
  // We can `process.exit()` here since it's a CLI script.
  // eslint-disable-next-line no-process-exit
  process.exit();
}

async function handleBreachesResponse(response) {
  try {
    const breachesJSON = JSON.parse(response.body);

    for (const breach of breachesJSON) {
      await DBUtils.createBreach(breach.Name, breach);
    }
  } catch (error) {
    console.error(error);
    // We can `process.exit()` here since it's a CLI script.
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

(async () => {
  if (args["--createAMBreach"]) {
    await DBUtils.createBreach("AllMusic", {
      Name: "AllMusic",
      BreachDate: "2015-012-06",
      DataClasses: ["Email addresses", "IP addresses", "Passwords", "Usernames", "Website activity"],
      PwnCount: 1436486,
    });
  }
  try {
    const breachesResponse = await got(
      `${AppConstants.HIBP_API_ROOT}/breaches`,
      {
        headers: {
          "User-Agent": HIBP_USER_AGENT,
        },
      }
    );
    await handleBreachesResponse(breachesResponse);
  } catch (error) {
    console.error(error);
    // We can `process.exit()` here since it's a CLI script.
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
  console.log("Done handling breaches response.");
  // We can `process.exit()` here since it's a CLI script.
  // eslint-disable-next-line no-process-exit
  process.exit();
})();
