export const arrayToCsv = (data: object[], headers: string[]): string => {
  const csvRows = [];
  csvRows.push(headers.join(','));
  data.forEach(row => {
    const values = headers.map(h => {
      const val = (row as any)[h];
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });
  return csvRows.join('\n');
};

export const downloadBlob = (filename: string, blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};
