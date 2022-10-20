const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5001';

export async function fetchLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${BASE_API}/auth/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      username: email,
      password,
    }),
  });

  const json = await res.json();

  if (res.ok) {
    return json;
  } else {
    throw new Error('Unknown error');
  }
}

export async function fetchCurrentUser() {
  const res = await fetch(`${BASE_API}/auth/current`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'GET',
  });

  const json = await res.json();
  if (res.ok) {
    return json;
  }
}

export async function fetchLogout() {
  const res = await fetch(`${BASE_API}/auth/logout`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({}),
  });

  const json = await res.json();
  if (res.ok) {
    return json;
  }
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
  const res = await fetch(`${BASE_API}/auth/local/register`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const json = await res.json();

  if (res.ok) {
    return json;
  } else {
    throw new Error('This email has already been used');
  }
}

export async function fecthReports() {
  const res = await fetch(`${BASE_API}/reports`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'GET',
  });

  const json = await res.json();

  if (res.ok) {
    return json;
  } else {
    throw new Error('Unknown error');
  }
}

export async function fetchUploadKeywordFile(file: File) {
  const formData = new FormData();

  formData.append('file', file);

  const res = await fetch(`${BASE_API}/scrapingJobs/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();

  if (res.ok) {
    return json;
  }
}

export async function fetchScrapingJob(id: string) {
  const res = await fetch(`${BASE_API}/scrapingJobs/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'GET',
  });

  const json = await res.json();

  if (res.ok) {
    return json;
  } else {
    throw new Error('Unknown error');
  }
}
