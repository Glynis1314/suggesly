export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getAccountId(account) {
  return account.companyId || slugify(account.company);
}

export function getContactId(contact) {
  return contact.contactId || slugify(contact.email || contact.name);
}