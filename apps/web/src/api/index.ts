import { extendedFetch } from './utils';

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5001';

export async function fetchLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return extendedFetch(`${BASE_API}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      username: email,
      password,
    }),
  });
}

export async function fetchCurrentUser() {
  return extendedFetch(`${BASE_API}/auth/current`, {
    method: 'GET',
  });
}

export async function fetchLogout() {
  return extendedFetch(`${BASE_API}/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function fetchSignup({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  return extendedFetch(`${BASE_API}/auth/local/register`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

export async function fecthReports() {
  return extendedFetch(`${BASE_API}/reports`, {
    method: 'GET',
  });
}

export async function fecthReport(id: string) {
  return extendedFetch(`${BASE_API}/reports/${id}`, {
    method: 'GET',
  });
}

export async function fetchUploadKeywordFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return extendedFetch(`${BASE_API}/scrapingJobs/upload`, {
    method: 'POST',
    body: formData,
  });
}

export async function fetchScrapingJob(id: string) {
  return extendedFetch(`${BASE_API}/scrapingJobs/${id}`, {
    method: 'GET',
  });
}
