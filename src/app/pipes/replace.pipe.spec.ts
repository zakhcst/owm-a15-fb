import { ReplacePipe } from './replace.pipe';

describe('ReplacePipe', () => {
  it('should create', () => {
    const pipe = new ReplacePipe();
    expect(pipe).toBeTruthy();
  });

  it('should replace', () => {
    const pipe = new ReplacePipe();
    
    let input = 'xyz';
    let target = 'x';
    let replacement = '1';
    let output = pipe.transform(input, target, replacement);
    expect(output).toBe('1yz')

    input = 'xyz';
    target = undefined;
    replacement = undefined;
    output = pipe.transform(input, target, replacement);
    expect(output).toBe(input)
    
    input = undefined;
    output = pipe.transform(input, target, replacement);
    expect(output).toBe('')

  });
});
