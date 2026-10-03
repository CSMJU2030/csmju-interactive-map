import { SubsystemRole } from './core-hub-identity';
import { can, canAny, Permission, ROLE_PERMISSIONS } from './permissions';
describe('Map domain permissions', () => {
  it.each([SubsystemRole.STUDENT, SubsystemRole.ALUMNI])('limits %s to map reads', role => {
    expect(can(role, Permission.PLACE_READ)).toBe(true);
    expect(can(role, Permission.PLACE_UPDATE)).toBe(false);
    expect(can(role, Permission.LECTURER_READ)).toBe(false);
  });
  it('lets staff edit geometry and personnel assignments without deleting', () => {
    expect(can(SubsystemRole.STAFF, Permission.PLACE_UPDATE)).toBe(true);
    expect(can(SubsystemRole.STAFF, Permission.LECTURER_CREATE)).toBe(true);
    expect(can(SubsystemRole.STAFF, Permission.PLACE_DELETE)).toBe(false);
  });
  it('grants admin all domain permissions', () => {
    for(const permission of Object.values(Permission)) expect(can(SubsystemRole.ADMIN, permission)).toBe(true);
  });
  it('accepts alternatives and defines every role', () => {
    expect(canAny(SubsystemRole.STUDENT, [Permission.PLACE_UPDATE, Permission.PLACE_READ])).toBe(true);
    for(const role of Object.values(SubsystemRole)) expect(ROLE_PERMISSIONS[role]).toBeDefined();
  });
});
