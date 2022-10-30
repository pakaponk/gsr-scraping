export class FetchError extends Error {}

interface ResponseErrorData {
  statusCode: number;
  message: string;
}
export class ResponseError<TRawError extends ResponseErrorData> extends Error {
  status: number;
  rawError: TRawError;

  constructor(status: number, error: TRawError) {
    super(error.message);
    this.status = status;
    this.rawError = error;
  }
}

export async function extendedFetch<
  // Set default type of TData as `any` to prevent untyped api functions declared in `api` folder from breaking the app
  // TODO: Remove or change default type of TData when all api functions is properly typed
  TData = any,
  TError extends ResponseErrorData = ResponseErrorData
>(url: string, options: RequestInit) {
  const { headers: customHeaders = {}, body, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {};
  if (!(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, {
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      credentials: 'include',
      body,
      ...restOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new FetchError(error.message);
    } else {
      throw error;
    }
  }

  if (res.ok) {
    const data = (await res.json()) as TData;
    return data as TData;
  } else {
    const error = (await res.json()) as TError;
    throw new ResponseError(res.status, error);
  }
}
