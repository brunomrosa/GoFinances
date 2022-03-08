import React, { useState } from "react";
import { Keyboard, Modal, TouchableWithoutFeedback, Alert } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from "@react-navigation/native";

import { Button } from "../../components/Forms/Button";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";
import { InputForm } from "../../components/Forms/InputForm";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";
import { CategorySelect } from "../CategorySelect";

import {
  Container,
  Fields,
  Form,
  Header,
  Title,
  TransactionTypes,
} from "./styles";
import { useAuth } from "../../hooks/auth";

interface FormData {
  [name: string]: any;
}

const schema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  amount: yup
    .number()
    .typeError("Informe um valor númerico")
    .positive("O valor não pode ser negativo")
    .required("O valor é obrigatório"),
});

export const Register = () => {
  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { user } = useAuth();

  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });

  const { navigate }: NavigationProp<ParamListBase> = useNavigation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const handleTransactionTypeSelect = (type: "positive" | "negative") => {
    setTransactionType(type);
  };

  const handleCloseCategorySelectModal = () => {
    setCategoryModalOpen(false);
  };
  const handleOpenCategorySelectModal = () => {
    setCategoryModalOpen(true);
  };

  const handleRegister = async (form: FormData) => {
    if (!transactionType) {
      return Alert.alert("Erro", "Selecione o tipo de transação");
    }
    if (category.key === "category") {
      return Alert.alert("Erro", "Selecione a categoria");
    }

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      category: category.key,
      type: transactionType,
      date: new Date(),
    };

    try {
      const dataKey = `@gofinances:transactions_user:${user.id}`;
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];
      await AsyncStorage.setItem(
        dataKey,
        JSON.stringify([...currentData, newTransaction])
      );

      reset();
      setTransactionType("");
      setCategory({ key: "category", name: "Categoria" });

      navigate("Listagem");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>
        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />
            <TransactionTypes>
              <TransactionTypeButton
                onPress={() => handleTransactionTypeSelect("positive")}
                type="up"
                title="Income"
                isActive={transactionType === "positive"}
              />
              <TransactionTypeButton
                onPress={() => handleTransactionTypeSelect("negative")}
                type="down"
                title="Outcome"
                isActive={transactionType === "negative"}
              />
            </TransactionTypes>
            <CategorySelectButton
              onPress={handleOpenCategorySelectModal}
              title={category.name}
            />
          </Fields>
          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>

        <Modal
          visible={categoryModalOpen}
          statusBarTranslucent={true}
          animationType="slide"
        >
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseCategorySelectModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
};
