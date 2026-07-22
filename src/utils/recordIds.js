export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getAccountId(account) {
  if (!account) return '';
  return account._id || account.id || account.companyId || slugify(account.company);
}

export function getContactId(contact) {
  if (!contact) return '';
  return contact._id || contact.id || contact.contactId || slugify(contact.email || contact.name);
}