// Format WhatsApp for display
export function formatWhatsAppDisplay(wa: string | null | undefined): string {
  if (!wa || wa === '-') return '-';
  
  // Format: 0812-3456-789
  if (wa.startsWith('628')) {
    const local = '0' + wa.substring(2);
    return formatPhoneNumber(local);
  }
  
  return formatPhoneNumber(wa);
}

function formatPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  
  // Format: 0812-3456-789
  const part1 = phone.substring(0, 4);
  const part2 = phone.substring(4, 8);
  const part3 = phone.substring(8);
  
  if (part3) {
    return `${part1}-${part2}-${part3}`;
  } else if (part2) {
    return `${part1}-${part2}`;
  }
  
  return part1;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Format date for input
export function formatDateInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Format luasan with unit
export function formatLuasan(luasan: number | null, kebutuhan: string): string {
  if (!luasan) return '-';
  
  // Determine unit based on kebutuhan
  let unit = 'm²';
  
  if (kebutuhan === 'Pagar') {
    unit = 'm'; // meter (keliling)
  } else if (kebutuhan === 'Panel Saja') {
    unit = 'unit';
  }
  
  return `${luasan.toLocaleString('id-ID')} ${unit}`;
}
