import { MethodsByApiPipe } from './methods-by-api.pipe';

describe('MethodsByApiPipe', () => {
  it('create an instance', () => {
    const pipe = new MethodsByApiPipe();
    expect(pipe).toBeTruthy();
  });
});
