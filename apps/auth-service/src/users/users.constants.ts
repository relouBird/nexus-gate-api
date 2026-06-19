export const USERS_PATTERNS = {
  USERS_CREATE: 'users.create',
  USERS_DELETE: 'users.delete',
  // Bonus — pas dans la doc d'origine mais quasi systématiquement nécessaires
  // côté gateway. À retirer si tu ne veux pas les exposer pour l'instant.
  USERS_FIND_ALL: 'users.findAll',
  USERS_FIND_ONE: 'users.findOne',
  USERS_UPDATE: 'users.update',
} as const;
