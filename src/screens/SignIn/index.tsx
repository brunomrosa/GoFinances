import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Plataform } from "react-native";
import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper,
} from "./styles";

import AppleSVG from "../../assets/apple.svg";
import GoogleSVG from "../../assets/google.svg";
import LogoSVG from "../../assets/logo.svg";
import { RFValue } from "react-native-responsive-fontsize";
import { SignInSocialButton } from "../../components/SignInSocialButton";
import { useAuth } from "../../hooks/auth";

import { useTheme } from "styled-components";

export const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      return await signInWithGoogle();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      Alert.alert("Não foi possível se conectar com o Google");
      setIsLoading(false);
    }
  };
  const handleSignInWithApple = async () => {
    try {
      setIsLoading(true);
      return await signInWithApple();
    } catch (error) {
      console.log(error);
      Alert.alert("Não foi possível se conectar com a conta Apple");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSVG width={RFValue(120)} height={RFValue(68)} />
          <Title>
            Controle suas{"\n"}finanças de forma{"\n"}muito simples
          </Title>
        </TitleWrapper>

        <SignInTitle>Faça seu login com{"\n"}uma das contas abaixo</SignInTitle>
      </Header>

      <Footer>
        <FooterWrapper>
          <SignInSocialButton
            onPress={handleSignInWithGoogle}
            title="Entrar com Google"
            svg={GoogleSVG}
          />
          {Platform.OS === "ios" && (
            <SignInSocialButton
              onPress={handleSignInWithApple}
              title="Entrar com Apple"
              svg={AppleSVG}
            />
          )}
        </FooterWrapper>

        {isLoading && (
          <ActivityIndicator
            color={theme.colors.shape}
            style={{ marginTop: 18 }}
          />
        )}
      </Footer>
    </Container>
  );
};
