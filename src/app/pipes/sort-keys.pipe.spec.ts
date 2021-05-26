import { SortKeysPipe } from './sort-keys.pipe';

describe('SortKeysPipe', () => {
  it('should create', () => {
    const pipe = new SortKeysPipe();
    expect(pipe).toBeTruthy();
  });

  it('should sort', () => {
    const pipe = new SortKeysPipe();
    const input = [
      { key: 3 },
      { key: 2 },
      { key: 1 },
    ];
    const expected = [
      { key: 1 },
      { key: 2 },
      { key: 3 },
    ];
    const output = pipe.transform(input);
    expect(expected).toEqual(output);
  });

  it('should sort reverse', () => {
    const pipe = new SortKeysPipe();
    const input = [
      { key: 1 },
      { key: 2 },
      { key: 3 },
    ];
    const expected = [
      { key: 3 },
      { key: 2 },
      { key: 1 },
    ];
    const output = pipe.transform(input, -1);
    expect(expected).toEqual(output);
  });

  it('should return empty array when expty input', () => {
    const pipe = new SortKeysPipe();
    const input = [];
    const expected = [];
    const output = pipe.transform(input);
    expect(expected).toEqual(output);
  });
});
