import React from "react";

import { Container, Title, Amount } from "./styles";

interface Props {
  title: string;
  amount: string;
  color: string;
}

const HistoryCard = ({ color, title, amount }: Props) => {
  return (
    <Container color={color}>
      <Title>{title}</Title>
      <Amount>{amount}</Amount>
    </Container>
  );
};

export default HistoryCard;
