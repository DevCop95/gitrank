/**
 * Export developers list to CSV format and trigger download
 */
export function exportToCSV(developers, countryName = 'Worldwide') {
  if (!developers || developers.length === 0) return;

  const headers = [
    'Rank',
    'Username',
    'Name',
    'Country',
    'Live Contributions',
    'Estimated Commits',
    'Stars Received',
    'Public Repos',
    'Followers',
    'Location',
    'Company',
    'Top Languages',
    'GitHub URL'
  ];

  const rows = developers.map((dev) => [
    dev.rank || '',
    `"${(dev.login || '').replace(/"/g, '""')}"`,
    `"${(dev.name || '').replace(/"/g, '""')}"`,
    `"${(dev.country || countryName).replace(/"/g, '""')}"`,
    dev.live_contributions || dev.estimated_commits || 0,
    dev.estimated_commits || 0,
    dev.stars_received || 0,
    dev.public_repos || 0,
    dev.followers || 0,
    `"${(dev.location || '').replace(/"/g, '""')}"`,
    `"${(dev.company || '').replace(/"/g, '""')}"`,
    `"${(dev.languages || []).join(', ').replace(/"/g, '""')}"`,
    dev.html_url || `https://github.com/${dev.login}`
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedCountry = countryName.toLowerCase().replace(/\s+/g, '-');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `gitrank-${sanitizedCountry}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export developers list to JSON format and trigger download
 */
export function exportToJSON(developers, countryName = 'Worldwide') {
  if (!developers || developers.length === 0) return;

  const exportPayload = {
    metadata: {
      source: 'GitTop / GitRank',
      country: countryName,
      exported_at: new Date().toISOString(),
      total_developers: developers.length
    },
    developers
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedCountry = countryName.toLowerCase().replace(/\s+/g, '-');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `gitrank-${sanitizedCountry}-${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
