import { ResponseStatusPipe } from './response-status.pipe';

describe('ResponseStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new ResponseStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
