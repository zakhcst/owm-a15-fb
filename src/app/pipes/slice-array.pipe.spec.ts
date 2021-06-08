import { SliceArrayPipe } from './slice-array.pipe';

describe('SliceArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new SliceArrayPipe();
    expect(pipe).toBeTruthy();
  });

  it('slice(0) ', () => {
    const pipe = new SliceArrayPipe();
    const input = [1,2,3];
    expect(pipe.transform(input, 0).length).toBe(input.length);
  });

  it('slice(!=0) ', () => {
    const pipe = new SliceArrayPipe();
    const input = [1,2,3];
    expect(pipe.transform(input, 2).length).toBe(2);
  });
});
