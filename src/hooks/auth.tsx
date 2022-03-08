import { createContext, useContext, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

interface AuthProviderProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  storedUserLoading: boolean;
}

interface AuthorizationResponse {
  params: { access_token: string };
  type: string;
}

const AuthContext = createContext({} as IAuthContextData);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>({} as User);
  const [storedUserLoading, setStoredUserLoading] = useState(true);

  const userStorageKey = "@gofinances:user";

  const signInWithGoogle = async () => {
    try {
      const RESPONSE_TYPE = "token";
      const SCOPE = encodeURI("profile email");

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type, params } = (await AuthSession.startAsync({
        authUrl,
      })) as AuthorizationResponse;

      if (type === "success") {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
        );
        const userLogged = await response.json();

        const user = {
          id: userLogged.id,
          name: userLogged.given_name,
          email: userLogged.email,
          photo: userLogged.picture,
        };
        setUser(user);

        await AsyncStorage.setItem(userStorageKey, JSON.stringify(user));
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const signInWithApple = async () => {
    try {
      const credentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credentials) {
        const userLogged = {
          id: String(credentials.user),
          name: credentials?.fullName!.givenName!,
          email: credentials?.email!,
          photo: `https://ui-avatars.com/api/?name=${credentials?.fullName!
            .givenName!}&length=1`,
        };

        setUser(userLogged);

        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(userStorageKey);
    setUser({} as User);
  };

  useEffect(() => {
    async function loadUserStorageData() {
      const userStored = await AsyncStorage.getItem(userStorageKey);

      if (userStored) {
        const userLogged = JSON.parse(userStored) as User;
        setUser(userLogged);
        setStoredUserLoading(false);
      }
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        storedUserLoading,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
