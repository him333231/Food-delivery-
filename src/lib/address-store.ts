export type Address = {
  id: string;
  label: string; // Home, Work, Other
  name: string;
  phone: string;
  line1: string;
  city: string;
  zip: string;
};

const KEY = "bites_addresses_v1";
const SELECTED_KEY = "bites_selected_address_v1";

export function getAddresses(): Address[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Address[];
  } catch {
    // ignore
  }
  return [];
}

export function saveAddress(addr: Omit<Address, "id">): Address {
  const next: Address = { id: `addr_${Date.now()}`, ...addr };
  const list = [next, ...getAddresses()];
  localStorage.setItem(KEY, JSON.stringify(list));
  localStorage.setItem(SELECTED_KEY, next.id);
  return next;
}

export function deleteAddress(id: string) {
  const list = getAddresses().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  if (getSelectedAddressId() === id) localStorage.removeItem(SELECTED_KEY);
}

export function getSelectedAddressId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SELECTED_KEY);
}

export function setSelectedAddressId(id: string) {
  localStorage.setItem(SELECTED_KEY, id);
}
