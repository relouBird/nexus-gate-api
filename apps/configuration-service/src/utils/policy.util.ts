import { InputJsonValue } from '@prisma/client/runtime/client';

export interface AccessPolicy {
  mode: 'include' | 'exclude';
  serverIds: string[];
}

export function canUserAccess(policy: AccessPolicy, serverId: string): boolean {
  const isAll = policy.serverIds.includes('*');
  if (policy.mode === 'include')
    return isAll || policy.serverIds.includes(serverId);
  if (policy.mode === 'exclude')
    return !isAll && !policy.serverIds.includes(serverId);
  return false;
}

export function policyAfterRevoke(
  policy: AccessPolicy,
  serverId: string,
): InputJsonValue {
  if (policy.mode === 'include' && policy.serverIds.includes('*')) {
    return { mode: 'exclude', serverIds: [serverId] };
  }
  if (policy.mode === 'include') {
    return {
      mode: 'include',
      serverIds: policy.serverIds.filter((id) => id !== serverId),
    };
  }
  return { mode: 'exclude', serverIds: [...policy.serverIds, serverId] };
}

export function policyAfterGrant(
  policy: AccessPolicy,
  serverId: string,
): InputJsonValue {
  if (policy.mode === 'include') {
    if (policy.serverIds.includes('*'))
      return policy as unknown as InputJsonValue; // déjà accès total
    return { mode: 'include', serverIds: [...policy.serverIds, serverId] };
  }
  // mode exclude
  if (policy.serverIds.includes('*')) {
    // excluait tout le monde → on ouvre uniquement pour ce serveur
    return { mode: 'include', serverIds: [serverId] };
  }
  return {
    mode: 'exclude',
    serverIds: policy.serverIds.filter((id) => id !== serverId),
  };
}
