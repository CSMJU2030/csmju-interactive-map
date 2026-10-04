import { PlaceReferenceService } from './place-reference.service';
import { ReferenceDataService } from '../core-hub/reference-data.service';

describe('Map reference ownership', () => {
  const assertActive = jest.fn();
  const service = new PlaceReferenceService({assertActive} as unknown as ReferenceDataService);
  beforeEach(() => jest.resetAllMocks());

  it('validates a selected room with Core using the caller token', async () => {
    await service.validate('CS-101', null, 'caller-token');
    expect(assertActive).toHaveBeenCalledWith('rooms', 'CS-101', 'caller-token');
  });
  it('rejects a local rename of a Core room', async () => {
    await expect(service.validate('CS-101', 'Renamed room', 'token')).rejects.toMatchObject({status:400});
    expect(assertActive).not.toHaveBeenCalled();
  });
  it('does not hide an unavailable or inactive Core room', async () => {
    const failure = new Error('Reference unavailable');
    assertActive.mockRejectedValue(failure);
    await expect(service.validate('CS-101', null, 'token')).rejects.toBe(failure);
  });
  it('allows a locally owned landmark but rejects an unnamed point', async () => {
    await service.validate(null, 'ทางเดิน', 'token');
    expect(assertActive).not.toHaveBeenCalled();
    await expect(service.validate(null, ' ', 'token')).rejects.toMatchObject({status:400});
  });
});
