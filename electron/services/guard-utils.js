const START_MARKER = "# AIBA-GUARD-START";
const END_MARKER = "# AIBA-GUARD-END";

function sanitizeSites(sites) {
  const domainPattern =
    /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
  const normalized = sites
    .map((site) => String(site).trim().toLowerCase().replace(/^www\./, ""))
    .filter((site) => domainPattern.test(site));
  return [...new Set(normalized)].slice(0, 40);
}

function stripGuardBlock(hostsContent) {
  const start = hostsContent.indexOf(START_MARKER);
  if (start < 0) return hostsContent;
  const end = hostsContent.indexOf(END_MARKER, start);
  if (end < 0) return hostsContent;
  const after = end + END_MARKER.length;
  return `${hostsContent.slice(0, start)}${hostsContent.slice(after)}`
    .replace(/\r?\n{3,}/g, "\n\n")
    .trimEnd();
}

module.exports = {
  START_MARKER,
  END_MARKER,
  sanitizeSites,
  stripGuardBlock,
};
