/**
 * Sample contacts list for recipient verification.
 * Used exclusively for in-browser simulation.
 */
export const SAMPLE_CONTACTS = [
  {
    name: "Ramesh Kirana Store",
    upiId: "ramesh.store@okbank",
    note: "Neighborhood Grocery Store"
  },
  {
    name: "Priya Sharma",
    upiId: "priya.sharma@okaxis",
    note: "Friend / Colleague"
  },
  {
    name: "Demo Shop",
    upiId: "shop.demo@okbank",
    note: "Sample merchant contact"
  }
];

export function isKnownContact(upiId, name) {
  if (!upiId) return false;
  const cleanId = upiId.trim().toLowerCase();
  const cleanName = (name || "").trim().toLowerCase();

  return SAMPLE_CONTACTS.some(contact => {
    const contactId = contact.upiId.toLowerCase();
    const contactName = contact.name.toLowerCase();
    return contactId === cleanId || (cleanName && contactName === cleanName);
  });
}
