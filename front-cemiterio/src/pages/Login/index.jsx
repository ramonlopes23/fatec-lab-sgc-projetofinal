import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MdOutlineAccountBalance } from "react-icons/md";
import { useAuthStore } from "../../stores/authStore";
import sgcLogo from "../../assets/SGC.png";
import logo_horizontal from "../../assets/logo_horizontal.png";
import {
    Page,
    BrandSide,
    BrandWrap,
    BrandLogo,
    BrandSubtitle,
    FormSide,
    Card,
    Title,
    Field,
    Label,
    Input,
    Select,
    HelperLink,
    ErrorText,
    PrefeituraLogo,
} from "./styles";
import SystemButton from "../../components/common/SystemButton";

export default function Login() {
    const navigate = useNavigate();

    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const error = useAuthStore((s) => s.error);

    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "",
    });

    if (isAuthenticated) return <Navigate to="/home" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ username: form.username, password: form.password });
            navigate("/home", { replace: true });
        } catch {
            // erro tratado na store
        }
    };

    return (
        <Page>
            <BrandSide>
                <BrandWrap>
                    <PrefeituraLogo src={logo_horizontal} alt="Prefeitura" />

                    <BrandLogo src={sgcLogo} alt="SGC" />
                    <BrandSubtitle>SISTEMA DE GERENCIAMENTO DE CEMITÉRIOS</BrandSubtitle>
                </BrandWrap>
            </BrandSide>


            <FormSide>
                <Card onSubmit={handleSubmit}>
                    <Title>LOGIN</Title>

                    <Field>
                        <Label>Usuário</Label>
                        <Input
                            placeholder="Digite o nome do usuário"
                            value={form.username}
                            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                        />
                    </Field>

                    <Field>
                        <Label>Senha</Label>
                        <Input
                            type="password"
                            placeholder="Digite a senha do usuário"
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        />
                    </Field>

                    <Field>
                        <Label>Cargo/Função</Label>
                        <Select
                            value={form.role}
                            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                        >
                            <option value="">Selecione seu cargo/função</option>
                            <option value="ADMIN">Administrador</option>
                            <option value="USER">Operador</option>
                        </Select>
                    </Field>

                    <HelperLink type="button">Esqueceu a senha?</HelperLink>

                    {error ? <ErrorText>{error}</ErrorText> : null}

                    <SystemButton type="submit" disabled={isLoading} sx={{ width: "100%", minHeight: 46, marginBottom:1 }}>
                        {isLoading ? "ENTRANDO..." : "ENTRAR"}
                    </SystemButton>

                    <SystemButton type="button" tone="cancel" sx={{ width: "100%", minHeight: 46 }}>CRIAR CONTA</SystemButton>
                </Card>
            </FormSide>
        </Page>
    );
}
