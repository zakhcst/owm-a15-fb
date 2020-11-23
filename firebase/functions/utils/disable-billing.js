const { google } = require("googleapis");
const { auth } = require("google-auth-library");

// Providing the current project has billing set.
const PROJECT_ID = process.env.GCLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const billing = google.cloudbilling("v1").projects;

exports.disableBilling = async () => {
  await _setAuthCredential();
  if (await _isBillingEnabled(PROJECT_NAME)) {
    console.log("Existing billing status: enabled");
    return _disableBillingForProject(PROJECT_NAME);
  } else {
    console.log("Existing billing status: disabled");
    return "Existing billing status: disabled";
  }
};

/**
 * @return {Promise} Credentials set globally
 */
const _setAuthCredential = async () => {
  const res = await auth.getApplicationDefault();

  let client = res.credential;
  if (client.hasScopes && !client.hasScopes()) {
    client = client.createScoped([
      "https://www.googleapis.com/auth/cloud-billing",
      "https://www.googleapis.com/auth/cloud-platform"
    ]);
    console.log("_setAuthCredential found scopes", client.scopes);
  } else {
    console.log("_setAuthCredential found no scopes");
  }

  // Set credential globally for all requests
  google.options({
    auth: client
  });
};

/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName Name of project to check if billing is enabled
 * @return {bool} Whether project has billing enabled or not
 */
const _isBillingEnabled = async projectName => {
  const res = await billing.getBillingInfo({ name: projectName });
  return res.data.billingEnabled;
};

/**
 * Disable billing for a project by removing its billing account
 * @param {string} projectName Name of project disable billing on
 * @return {string} Text containing response from disabling billing
 */
const _disableBillingForProject = async projectName => {
  const res = await billing.updateBillingInfo({
    name: projectName,
    resource: { billingAccountName: "" } // Disable billing
  });

  console.log(`Billing disabled successfully: ${JSON.stringify(res.data)}`);
  return `Billing disabled successfully: ${JSON.stringify(res.data)}`;
};
