import { SubsystemRole } from './core-hub-identity';
export enum Permission {
  PLACE_READ = 'place:read', PLACE_CREATE = 'place:create', PLACE_UPDATE = 'place:update', PLACE_DELETE = 'place:delete',
  LECTURER_READ = 'lecturer:read', LECTURER_CREATE = 'lecturer:create', LECTURER_UPDATE = 'lecturer:update', LECTURER_DELETE = 'lecturer:delete',
}
const READ = [Permission.PLACE_READ];
const STAFF = [...READ, Permission.PLACE_CREATE, Permission.PLACE_UPDATE, Permission.LECTURER_READ, Permission.LECTURER_CREATE, Permission.LECTURER_UPDATE];
export const ROLE_PERMISSIONS: Readonly<Record<SubsystemRole, readonly Permission[]>> = Object.freeze({
  [SubsystemRole.STUDENT]: Object.freeze(READ), [SubsystemRole.ALUMNI]: Object.freeze(READ),
  [SubsystemRole.STAFF]: Object.freeze(STAFF), [SubsystemRole.ADMIN]: Object.freeze(Object.values(Permission)),
});
export function can(role: SubsystemRole, permission: Permission): boolean { return ROLE_PERMISSIONS[role]?.includes(permission) ?? false; }
export function canAny(role: SubsystemRole, permissions: readonly Permission[]): boolean { return permissions.some(permission => can(role, permission)); }
