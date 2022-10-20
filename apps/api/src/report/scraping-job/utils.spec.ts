import { encodeGoogleSearchQuery, getGoogleSearchResultData } from './utils';

describe('encodeGoogleSearchQuery', () => {
  it('return original string if the given keyword is only contain alphanumeric characters', () => {
    expect(encodeGoogleSearchQuery('hello')).toEqual('hello');
  });
  it('should change white space to + character', () => {
    expect(encodeGoogleSearchQuery('hello world')).toEqual('hello+world');
  });
});

describe('getGoogleSearchResultData', () => {
  it('return total links (total numbers of anchor tag)', () => {
    const { totalLinks } = getGoogleSearchResultData(`
      <a href="https://www.google.com"></a>
      <a href="https://www.google.com"></a>`);
    expect(totalLinks).toEqual(2);
  });
  it('return total adwords (AdWord is inside html elements with class "uEierd")', () => {
    const { totalAdwords } = getGoogleSearchResultData(`
      <div class="uEierd"></div>
      <div></div>
      <div class="uEierd"></div>
      <div class="uEierd"></div>
      <div></div>
      <div class="uEierd"></div>
      `);
    expect(totalAdwords).toEqual(4);
  });
  it('return total search results (is inside the element with id "result-stats")', () => {
    const { totalSearchResults } = getGoogleSearchResultData(`
      <div id="result-stats">About 8,260,000,000 results (0.34 seconds)</div>
      `);
    expect(totalSearchResults).toEqual(BigInt(8_260_000_000));
  });
});
