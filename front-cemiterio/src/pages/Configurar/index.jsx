import React, { useState } from "react";
import { Avatar, BtnPrimary,ColumnLeft,ColumnRight,Container,Field,FormActions,FormGrid,FormStyled,Input,Select,Title} from "../Configurar/styles";


export default function Configurar() {

    const [form, setForm] = useState({
        nome: "",
        email: "",
        cpf: "",
        cargo: "",
        senha: "",
        novasenha: "",
        foto:"",
    });

    const cpfMask = value => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    };

    const [registros, setRegistros] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "cpf") {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
            setForm(prev => ({ ...prev, cpf: digitsOnly }));
            return;
        }
        setForm({ ...form, [name]: value });
    }

    const handleFileChange = (e) =>{
        const file = e.target.files && e.target.files[0];
        if(!file){
            setForm(prev => ({ ...prev, foto: "" }));
            localStorage.removeItem("userPhoto");
            window.dispatchEvent(new Event("userPhotoUpdated"));
        return; 
        }
        const reader = new FileReader();
        reader.onload = () =>{
            const dataUrl = reader.result;
            setForm(prev=>({...prev, foto:reader.result}));
            try{localStorage.setItem("userPhoto", dataUrl); } 
            catch (err) {/* ignore storage errors */}
            window.dispatchEvent(new Event("userPhotoUpdated"));
        }
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setRegistros([...registros, form]);
        setForm({
            nome: "",
            email: "",
            cpf: "",
            cargo: "",
            senha: "",
            novasenha: "",
            foto:"",
        });
            
    }
  

    return (
        <div>
            <Container>
                <FormStyled onSubmit={handleSubmit}>
                    <Title>CONFIGURAR PERFIL</Title>

                    <FormGrid>
                        <ColumnLeft>
                            <Field>
                                <label>Nome completo</label>
                                <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Digite seu nome completo" />
                            </Field>

                            <Field>
                                <label>Email</label>
                                <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Digite o email que deseja utilizar" />

                            </Field>

                            <Field>
                                <label>CPF</label>
                                <Input name="cpf" value={cpfMask(form.cpf)} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                            </Field>

                            <Field>
                                <label>Cargo/Função</label>
                                <Select name="cargo" value={form.cargo} onChange={handleChange}>
                                    <option value="">Selecione</option>
                                    <option value="desenvolvedor">Desenvolvedor</option>
                                    <option value="cemiterio">Administração do cemitério</option>
                                    <option value="ctrl/sec">Controladoria/Secretaria</option>
                                </Select>
                            </Field>

                               <Field>
                                <label>Senha</label>
                                <Input type="password" name="senha" value={form.senha} onChange={handleChange} placeholder="Digite a senha atual" />
                            </Field>

                            <Field>
                                <label>Nova Senha</label>
                                <Input type="password" name="novasenha" value={form.novasenha} onChange={handleChange} placeholder="Digite a nova senha" />
                            </Field>

                        </ColumnLeft>

                        <ColumnRight>

                            <Field>
                                <label>
                                    Foto de perfil
                                </label>
                                
                                {form.foto && (
                                    <Avatar src={form.foto} alt="preview" />
                                )}
                                <Input type="file" accept="image/*" onChange={handleFileChange}/>

                            </Field>

                         

                            <FormActions>
                                <BtnPrimary type="submit">Salvar</BtnPrimary>
                            </FormActions>
                        </ColumnRight>
                    </FormGrid>
                </FormStyled>
            </Container>
    </div>
        
    )
}