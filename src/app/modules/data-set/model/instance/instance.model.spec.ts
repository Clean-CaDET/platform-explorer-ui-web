import { SessionStorageService } from 'src/app/session-storage.service';
import { Instance } from './instance.model';

describe('Instance', () => {
  it('should create an instance', () => {
    var sessionService: SessionStorageService = new SessionStorageService();
    expect(new Instance(sessionService)).toBeTruthy();
  });
});
