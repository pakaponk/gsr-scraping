import { useRouter } from 'next/router';
import {
  useContext,
  Dispatch,
  createContext,
  PropsWithChildren,
  useReducer,
  useEffect,
} from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

type Action = { type: 'login'; payload: { user: User } };

type State = {
  authState: 'PENDING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';
  user: User | null;
};

const AuthStateContext = createContext<State | undefined>(undefined);
const AuthDispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined
);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'login': {
      return {
        ...state,
        authState: 'AUTHENTICATED',
        user: action.payload.user,
      };
    }
    default: {
      return state;
    }
  }
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(reducer, {
    authState: 'PENDING',
    user: null,
  });
  const { authState } = state;

  const router = useRouter();

  useEffect(() => {
    if (authState === 'AUTHENTICATED') {
      if (router.pathname === '/') {
        router.push('/reports');
      }
    } else if (authState === 'UNAUTHENTICATED') {
      if (router.pathname !== '/') {
        router.push('/');
      }
    }
  }, [authState, router]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuth(): [State, Dispatch<Action>] {
  const state = useContext(AuthStateContext);
  if (state === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  const dispatch = useContext(AuthDispatchContext);
  if (dispatch === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return [state, dispatch];
}
