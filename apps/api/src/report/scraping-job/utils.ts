import { Report } from '@prisma/client';
import { load } from 'cheerio';

// Collected from https://developers.whatismybrowser.com/
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 12.6; rv:106.0) Gecko/20100101 Firefox/106.0',
  'Mozilla/5.0 (X11; Linux i686; rv:106.0) Gecko/20100101 Firefox/106.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:106.0) Gecko/20100101 Firefox/106.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:106.0) Gecko/20100101 Firefox/106.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:106.0) Gecko/20100101 Firefox/106.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edge/106.0.1370.47',
];

export function randomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

type GoogleSearchResultData = Pick<
  Report,
  'totalAdwords' | 'totalLinks' | 'totalSearchResults'
>;

export function getGoogleSearchResultData(
  html: string,
): GoogleSearchResultData {
  const $ = load(html);

  const totalSearchResults = BigInt(
    $('#result-stats')
      ?.text()
      ?.replace(/\(.*\)/g, '') // Remove Time result which is inside a parenthese
      ?.match(/\d+/g) // Match all numbers to ignore comma
      ?.join('') ?? 0,
  );
  const totalAdwords = $('.uEierd').length;
  const totalLinks = $('a').length;

  return {
    totalAdwords,
    totalLinks,
    totalSearchResults,
  };
}

export function encodeGoogleSearchQuery(keyword: string) {
  return encodeURIComponent(keyword)
    .replace(/%20/g, '+')
    .replace(/\!/g, '%21')
    .replace(/\'/, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/, '%29');
}
