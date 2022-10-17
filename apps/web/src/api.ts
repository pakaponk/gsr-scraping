const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5001';

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
