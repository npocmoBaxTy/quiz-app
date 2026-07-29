import { createContext } from "react";
import type { Ir } from "./FormProvider";

export interface IUser {
  id: string;
  full_name: string;
  email: string;
  group?: string | "";
  role: string;
}

type FormState = {
  email: string;
  password: string;
  rePassword: string;
  name: string;
  step: number;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setRePassword: (v: string) => void;
  setName: (v: string) => void;
  setStep: (v: number) => void;
  ROLES: Ir[];
  role: string;
  setRole: (v: string) => void;
  groupId: string;
  setGroupId: (v: string) => void;
};

export const FormContext = createContext<FormState | null>(null);
