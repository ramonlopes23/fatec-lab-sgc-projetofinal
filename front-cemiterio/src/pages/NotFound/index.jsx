import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Button } from './styles'

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Container>
            <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>
            <p style={{ fontSize: "24px", margin: "10px 0" }}>Página não encontrada</p>
            <p style={{ fontSize: "16px", opacity: 0.9 }}>A página que você está procurando não existe.</p>
            <Button onClick={() => navigate("/home")}>Voltar para Home</Button>
        </Container>
    )
}
