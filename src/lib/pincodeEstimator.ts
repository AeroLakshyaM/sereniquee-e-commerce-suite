export interface PincodeDeliveryEstimate {
  pincode: string;
  region: string;
  state: string;
  minDays: number;
  maxDays: number;
  deliveryDateString: string;
  isDelhiNcr: boolean;
  isMetro: boolean;
  isCodAvailable: boolean;
  freeShippingEligible: boolean;
  courierPartner: string;
}

const PINCODE_STORAGE_KEY = 'sereniquee_pincode';

/** Add business days skipping Sundays */
function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) {
      // Not Sunday
      added++;
    }
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function estimatePincodeDelivery(pincode: string): PincodeDeliveryEstimate | null {
  const cleaned = pincode.trim().replace(/\D/g, '');
  if (cleaned.length !== 6 || cleaned.startsWith('0')) {
    return null;
  }

  const prefix2 = cleaned.slice(0, 2);
  const prefix3 = cleaned.slice(0, 3);
  const firstDigit = cleaned[0];

  let region = 'India';
  let state = 'India';
  let minDays = 3;
  let maxDays = 5;
  let isDelhiNcr = false;
  let isMetro = false;

  // Specific Metro & Regional mapping
  if (prefix2 === '11') {
    region = 'Delhi NCR';
    state = 'Delhi';
    minDays = 1;
    maxDays = 2;
    isDelhiNcr = true;
    isMetro = true;
  } else if (prefix3 === '121' || prefix3 === '122' || prefix3 === '124') {
    region = 'Gurgaon / Faridabad (NCR)';
    state = 'Haryana';
    minDays = 1;
    maxDays = 2;
    isDelhiNcr = true;
    isMetro = true;
  } else if (prefix3 === '201') {
    region = 'Noida / Ghaziabad (NCR)';
    state = 'Uttar Pradesh';
    minDays = 1;
    maxDays = 2;
    isDelhiNcr = true;
    isMetro = true;
  } else if (prefix2 === '40') {
    region = 'Mumbai Metro';
    state = 'Maharashtra';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '41') {
    region = 'Pune Region';
    state = 'Maharashtra';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '56') {
    region = 'Bengaluru Metro';
    state = 'Karnataka';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '50') {
    region = 'Hyderabad Metro';
    state = 'Telangana';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '60') {
    region = 'Chennai Metro';
    state = 'Tamil Nadu';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '70') {
    region = 'Kolkata Metro';
    state = 'West Bengal';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '38') {
    region = 'Ahmedabad';
    state = 'Gujarat';
    minDays = 2;
    maxDays = 3;
    isMetro = true;
  } else if (prefix2 === '30') {
    region = 'Jaipur';
    state = 'Rajasthan';
    minDays = 2;
    maxDays = 3;
  } else {
    // Broader Zonal rules
    switch (firstDigit) {
      case '1':
        region = 'Northern Region';
        state = 'North India';
        minDays = 2;
        maxDays = 4;
        break;
      case '2':
        region = 'Uttar Pradesh / Uttarakhand';
        state = 'North India';
        minDays = 2;
        maxDays = 4;
        break;
      case '3':
        region = 'Western Region';
        state = 'Rajasthan / Gujarat';
        minDays = 3;
        maxDays = 4;
        break;
      case '4':
        region = 'Western / Central Region';
        state = 'Maharashtra / MP';
        minDays = 3;
        maxDays = 4;
        break;
      case '5':
        region = 'Southern Region';
        state = 'Karnataka / AP / Telangana';
        minDays = 3;
        maxDays = 5;
        break;
      case '6':
        region = 'Southern Region';
        state = 'Tamil Nadu / Kerala';
        minDays = 3;
        maxDays = 5;
        break;
      case '7':
        region = 'Eastern Region';
        state = 'West Bengal / Odisha / North East';
        minDays = 4;
        maxDays = 6;
        break;
      case '8':
        region = 'Eastern Region';
        state = 'Bihar / Jharkhand';
        minDays = 3;
        maxDays = 5;
        break;
    }
  }

  const now = new Date();
  const deliveryDate = addBusinessDays(now, maxDays);
  const deliveryDateString = formatDate(deliveryDate);

  return {
    pincode: cleaned,
    region,
    state,
    minDays,
    maxDays,
    deliveryDateString,
    isDelhiNcr,
    isMetro,
    isCodAvailable: true,
    freeShippingEligible: true,
    courierPartner: isDelhiNcr ? 'Delhivery Direct / Bluedart' : 'Bluedart Air / Delhivery Express',
  };
}

export function getSavedPincode(): string {
  try {
    return localStorage.getItem(PINCODE_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function savePincode(pincode: string): void {
  try {
    localStorage.setItem(PINCODE_STORAGE_KEY, pincode);
  } catch {}
}
