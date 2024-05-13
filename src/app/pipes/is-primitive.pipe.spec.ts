import { IsPrimitivePipe } from './is-primitive.pipe';

describe('IsPrimitivePipe', () => {
  it('create an instance', () => {
    const pipe = new IsPrimitivePipe();
    expect(pipe).toBeTruthy();
  });
});
