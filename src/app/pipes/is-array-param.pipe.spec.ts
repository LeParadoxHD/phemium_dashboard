import { IsArrayParamPipe } from './is-array-param.pipe';

describe('IsArrayParamPipe', () => {
  it('create an instance', () => {
    const pipe = new IsArrayParamPipe();
    expect(pipe).toBeTruthy();
  });
});
