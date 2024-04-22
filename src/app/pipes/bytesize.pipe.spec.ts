import { BytesizePipe } from './bytesize.pipe';

describe('BytesizePipe', () => {
  it('create an instance', () => {
    const pipe = new BytesizePipe();
    expect(pipe).toBeTruthy();
  });
});
